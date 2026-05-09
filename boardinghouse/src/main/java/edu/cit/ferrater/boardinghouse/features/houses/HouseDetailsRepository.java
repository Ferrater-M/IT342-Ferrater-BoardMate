package edu.cit.ferrater.boardinghouse.features.houses;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HouseDetailsRepository extends JpaRepository<HouseDetails, Long> {
    List<HouseDetails> findByOwner(User owner);
}
