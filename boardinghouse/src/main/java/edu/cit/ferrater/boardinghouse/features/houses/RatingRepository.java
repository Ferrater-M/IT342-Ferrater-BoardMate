package edu.cit.ferrater.boardinghouse.features.houses;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByHouseId(Long houseId);
    Optional<Rating> findByHouseIdAndUserId(Long houseId, Long userId);
}
