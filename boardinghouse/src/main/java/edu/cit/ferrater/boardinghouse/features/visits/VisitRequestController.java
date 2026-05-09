package edu.cit.ferrater.boardinghouse.features.visits;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import edu.cit.ferrater.boardinghouse.features.auth.UserService;
import edu.cit.ferrater.boardinghouse.features.houses.HouseDetails;
import edu.cit.ferrater.boardinghouse.features.houses.HouseDetailsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "*")
public class VisitRequestController {

    private final VisitRequestRepository visitRequestRepository;
    private final HouseDetailsRepository houseDetailsRepository;
    private final UserService userService;

    public VisitRequestController(VisitRequestRepository visitRequestRepository,
                                HouseDetailsRepository houseDetailsRepository,
                                UserService userService) {
        this.visitRequestRepository = visitRequestRepository;
        this.houseDetailsRepository = houseDetailsRepository;
        this.userService = userService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestVisit(@RequestBody Map<String, String> payload, Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName());
            Long houseId = Long.parseLong(payload.get("houseId"));
            String message = payload.get("message");
            LocalDateTime requestedDateTime = LocalDateTime.parse(payload.get("dateTime"));

            HouseDetails house = houseDetailsRepository.findById(houseId)
                    .orElseThrow(() -> new RuntimeException("House not found"));

            VisitRequest request = VisitRequest.builder()
                    .user(user)
                    .house(house)
                    .requestedDateTime(requestedDateTime)
                    .message(message)
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build();

            visitRequestRepository.save(request);
            return ResponseEntity.ok(Map.of("message", "Visit request submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<VisitRequest>> getMyRequests(Principal principal) {
        User user = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(visitRequestRepository.findByUser(user));
    }

    @GetMapping("/owner/requests")
    public ResponseEntity<List<VisitRequest>> getOwnerRequests(Principal principal) {
        User owner = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(visitRequestRepository.findByHouseOwner(owner));
    }

    @PostMapping("/{requestId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long requestId, @RequestBody Map<String, String> payload, Principal principal) {
        try {
            User owner = userService.findByEmail(principal.getName());
            String status = payload.get("status");

            VisitRequest request = visitRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            if (!request.getHouse().getOwner().getId().equals(owner.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
            }

            request.setStatus(status);
            visitRequestRepository.save(request);
            return ResponseEntity.ok(Map.of("message", "Status updated to " + status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
