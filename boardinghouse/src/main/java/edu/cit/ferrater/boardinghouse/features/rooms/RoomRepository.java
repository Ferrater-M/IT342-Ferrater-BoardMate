package edu.cit.ferrater.boardinghouse.features.rooms;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Room findByOccupant(User occupant);
    java.util.Optional<Room> findByOccupantId(Long occupantId);
}
