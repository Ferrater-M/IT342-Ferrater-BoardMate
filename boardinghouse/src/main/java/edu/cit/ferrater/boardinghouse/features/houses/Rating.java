package edu.cit.ferrater.boardinghouse.features.houses;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "house_ratings")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "house_id")
    private HouseDetails house;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private int score; // 1-5
}
