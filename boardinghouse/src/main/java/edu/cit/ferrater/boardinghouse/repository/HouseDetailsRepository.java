package edu.cit.ferrater.boardinghouse.repository;

import edu.cit.ferrater.boardinghouse.entity.HouseDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HouseDetailsRepository extends JpaRepository<HouseDetails, Long> {
}