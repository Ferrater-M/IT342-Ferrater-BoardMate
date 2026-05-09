package edu.cit.ferrater.boardinghouse.features.visits;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import edu.cit.ferrater.boardinghouse.features.houses.HouseDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRequestRepository extends JpaRepository<VisitRequest, Long> {
    List<VisitRequest> findByUser(User user);
    List<VisitRequest> findByHouse(HouseDetails house);
    List<VisitRequest> findByHouseOwner(User owner);
}
