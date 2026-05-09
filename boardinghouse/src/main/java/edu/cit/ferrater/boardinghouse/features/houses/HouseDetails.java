package edu.cit.ferrater.boardinghouse.features.houses;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import edu.cit.ferrater.boardinghouse.features.rooms.Room;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "house_details")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class HouseDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String description;
    private String price;
    private double rating;

    @Column(name = "rooms_left")
    private int roomsLeft;

    @Column(name = "image_url")
    private String imageUrl;

    @jakarta.persistence.ElementCollection
    @jakarta.persistence.CollectionTable(name = "house_images", joinColumns = @jakarta.persistence.JoinColumn(name = "house_id"))
    @Column(name = "url")
    private java.util.List<String> imageUrls;

    @com.fasterxml.jackson.annotation.JsonManagedReference
    @jakarta.persistence.OneToMany(mappedBy = "house", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true, fetch = jakarta.persistence.FetchType.EAGER)
    private java.util.List<Room> rooms;

    @jakarta.persistence.ManyToOne
    @jakarta.persistence.JoinColumn(name = "owner_id")
    private User owner;

    @jakarta.persistence.Transient
    private int initialRoomCount;

    // Helper to get count of available rooms
    public int getCalculatedRoomsLeft() {
        if (rooms == null) return 0;
        return (int) rooms.stream()
                .filter(r -> "Available".equalsIgnoreCase(r.getStatus()))
                .count();
    }
}
