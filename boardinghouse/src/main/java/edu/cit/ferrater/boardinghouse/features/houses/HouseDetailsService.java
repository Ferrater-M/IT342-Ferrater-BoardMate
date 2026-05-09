package edu.cit.ferrater.boardinghouse.features.houses;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import edu.cit.ferrater.boardinghouse.features.rooms.BillingReceipt;
import edu.cit.ferrater.boardinghouse.features.rooms.BillingReceiptRepository;
import edu.cit.ferrater.boardinghouse.features.rooms.Room;
import edu.cit.ferrater.boardinghouse.features.rooms.RoomRepository;

@Service
@Transactional
public class HouseDetailsService {

    private final HouseDetailsRepository repo;
    private final RoomRepository roomRepo;
    private final BillingReceiptRepository receiptRepo;
    private final RatingRepository ratingRepo;

    public HouseDetailsService(HouseDetailsRepository repo, RoomRepository roomRepo, BillingReceiptRepository receiptRepo, RatingRepository ratingRepo) {
        this.repo = repo;
        this.roomRepo = roomRepo;
        this.receiptRepo = receiptRepo;
        this.ratingRepo = ratingRepo;
    }

    public void rateHouse(Long houseId, User user, int score) {
        HouseDetails house = repo.findById(houseId).orElseThrow();
        
        Optional<Rating> existing = ratingRepo.findByHouseIdAndUserId(houseId, user.getId());
        Rating rating;
        if (existing.isPresent()) {
            rating = existing.get();
            rating.setScore(score);
        } else {
            rating = Rating.builder()
                    .house(house)
                    .user(user)
                    .score(score)
                    .build();
        }
        ratingRepo.save(rating);

        // Recalculate average rating
        List<Rating> allRatings = ratingRepo.findByHouseId(houseId);
        double avg = allRatings.stream().mapToInt(Rating::getScore).average().orElse(0.0);
        house.setRating(Math.round(avg * 10.0) / 10.0); // Round to 1 decimal
        repo.save(house);
    }

    public int getUserRating(Long houseId, Long userId) {
        return ratingRepo.findByHouseIdAndUserId(houseId, userId)
                .map(Rating::getScore)
                .orElse(0);
    }

    public List<BillingReceipt> getReceiptsByRoom(Long roomId) {
        return receiptRepo.findByRoomId(roomId);
    }

    public BillingReceipt saveReceipt(BillingReceipt receipt) {
        if (receipt.getCreatedAt() == null) {
            receipt.setCreatedAt(java.time.LocalDateTime.now());
        }
        return receiptRepo.save(receipt);
    }

    public List<HouseDetails> getByOwner(User owner) {
        return repo.findByOwner(owner);
    }

    public List<HouseDetails> getAll() {
        return repo.findAll();
    }

    public Optional<HouseDetails> getById(Long id) {
        return repo.findById(id);
    }

    public List<HouseDetails> getRecommended() {
        // Simple recommendation logic: houses with rating >= 4.0
        return repo.findAll().stream()
                .filter(h -> h.getRating() >= 4.0)
                .toList();
    }

    public HouseDetails save(HouseDetails house) {
        System.out.println("Saving house: " + house.getName() + " with initialRoomCount: " + house.getInitialRoomCount());
        
        // Sync rooms left before saving
        house.setRoomsLeft(house.getCalculatedRoomsLeft());
        HouseDetails saved = repo.save(house);
        
        // Bulk generate rooms if requested
        if (house.getInitialRoomCount() > 0) {
            System.out.println("Generating " + house.getInitialRoomCount() + " rooms for " + saved.getName());
            if (saved.getRooms() == null) {
                saved.setRooms(new java.util.ArrayList<>());
            }
            
            for (int i = 1; i <= house.getInitialRoomCount(); i++) {
                Room room = Room.builder()
                        .roomNumber("Room " + (100 + i))
                        .type("Single")
                        .price(saved.getPrice())
                        .inclusions("Water • Wi-Fi")
                        .status("Available")
                        .paymentStatus("Not Paid")
                        .billingMonth(java.time.LocalDate.now().toString())
                        .house(saved)
                        .build();
                Room savedRoom = roomRepo.save(room);
                saved.getRooms().add(savedRoom);
            }
            // Update rooms_left after generating
            saved.setRoomsLeft(house.getInitialRoomCount());
            saved = repo.save(saved);
        }
        
        return saved;
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public Room saveRoom(Room room) {
        Room saved = roomRepo.save(room);
        // After adding/updating a room, refresh the house's rooms_left count
        if (saved.getHouse() != null) {
            HouseDetails house = repo.findById(saved.getHouse().getId()).orElse(null);
            if (house != null) {
                house.setRoomsLeft(house.getCalculatedRoomsLeft());
                repo.save(house);
            }
        }
        return saved;
    }

    public Room getRoomById(Long id) {
        return roomRepo.findById(id).orElseThrow();
    }

    public void deleteRoom(Long roomId) {
        Room room = roomRepo.findById(roomId).orElse(null);
        if (room != null && room.getHouse() != null) {
            HouseDetails house = repo.findById(room.getHouse().getId()).orElse(null);
            roomRepo.deleteById(roomId);
            if (house != null) {
                // Refresh count after deletion
                house.setRoomsLeft(house.getCalculatedRoomsLeft());
                repo.save(house);
            }
        } else {
            roomRepo.deleteById(roomId);
        }
    }
}
