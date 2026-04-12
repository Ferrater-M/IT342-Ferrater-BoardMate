package edu.cit.ferrater.boardinghouse.entity;

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

}
