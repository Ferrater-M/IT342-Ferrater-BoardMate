package edu.cit.ferrater.boardinghouse.features.houses;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import edu.cit.ferrater.boardinghouse.features.auth.UserService;
import edu.cit.ferrater.boardinghouse.features.rooms.BillingReceipt;
import edu.cit.ferrater.boardinghouse.features.rooms.Room;

@RestController
@RequestMapping("/api/houses")
@CrossOrigin(origins = "*")
public class HouseDetailsController {

    private final HouseDetailsService service;
    private final UserService userService;

    public HouseDetailsController(HouseDetailsService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @GetMapping("/rooms/{roomId}/receipts")
    public List<BillingReceipt> getReceipts(@PathVariable Long roomId) {
        return service.getReceiptsByRoom(roomId);
    }

    @PostMapping("/rooms/{roomId}/receipts")
    public BillingReceipt createReceipt(@PathVariable Long roomId, @RequestBody BillingReceipt receipt, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        Room room = service.getRoomById(roomId);
        
        // Only owner of the house can create a receipt for their room
        if (!room.getHouse().getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        receipt.setRoom(room);
        // If occupant is present in room, link it
        if (room.getOccupant() != null) {
            receipt.setOccupant(room.getOccupant());
        }
        
        return service.saveReceipt(receipt);
    }

    @GetMapping
    public List<HouseDetails> getAll() {
        return service.getAll();
    }

    @GetMapping("/my-houses")
    public List<HouseDetails> getMyHouses(Principal principal) {
        User user = userService.findByEmail(principal.getName());
        return service.getByOwner(user);
    }

    @GetMapping("/{id}")
    public HouseDetails getById(@PathVariable Long id) {
        return service.getById(id).orElse(null);
    }

    @GetMapping("/recommended")
    public List<HouseDetails> getRecommended() {
        return service.getRecommended();
    }

    @PostMapping
    public HouseDetails create(@RequestBody HouseDetails house, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        house.setOwner(user);
        return service.save(house);
    }

    @PutMapping("/{id}")
    public HouseDetails update(@PathVariable Long id, @RequestBody HouseDetails house, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        HouseDetails existing = service.getById(id).orElseThrow();
        
        // Ensure only the owner can update
        if (!existing.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        house.setId(id);
        house.setOwner(user);
        return service.save(house);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        HouseDetails house = service.getById(id).orElseThrow();
        if (!house.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        service.delete(id);
    }

    @PostMapping("/{id}/rooms")
    public Room addRoom(@PathVariable Long id, @RequestBody Room room, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        HouseDetails house = service.getById(id).orElseThrow();
        if (!house.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        room.setHouse(house);
        return service.saveRoom(room);
    }

    @DeleteMapping("/rooms/{roomId}")
    public void deleteRoom(@PathVariable Long roomId, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        Room room = service.getRoomById(roomId);
        if (!room.getHouse().getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        service.deleteRoom(roomId);
    }

    @PutMapping("/rooms/{roomId}")
    public Room updateRoom(@PathVariable Long roomId, @RequestBody Room roomDetails, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        Room existing = service.getRoomById(roomId);
        
        if (!existing.getHouse().getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        existing.setStatus(roomDetails.getStatus());
        existing.setOccupantName(roomDetails.getOccupantName());
        existing.setPrice(roomDetails.getPrice());
        existing.setInclusions(roomDetails.getInclusions());
        existing.setPaymentStatus(roomDetails.getPaymentStatus());
        existing.setBillingMonth(roomDetails.getBillingMonth());
        
        if (roomDetails.getOccupant() != null && roomDetails.getOccupant().getId() != null) {
            User occupant = userService.findById(roomDetails.getOccupant().getId());
            existing.setOccupant(occupant);
        } else {
            existing.setOccupant(null);
            // If status is changed back to Available, clear the name too
            if ("Available".equals(roomDetails.getStatus())) {
                existing.setOccupantName(null);
            }
        }

        return service.saveRoom(existing);
    }

    @GetMapping("/users/students")
    public List<User> getStudents() {
        return userService.findAll().stream()
                .filter(u -> "ROLE_USER".equals(u.getRole()))
                .toList();
    }

    @PostMapping("/{id}/rate")
    public void rateHouse(@PathVariable Long id, @RequestParam int score, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        service.rateHouse(id, user, score);
    }

    @GetMapping("/{id}/my-rating")
    public int getMyRating(@PathVariable Long id, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        return service.getUserRating(id, user.getId());
    }
}
