package edu.cit.ferrater.boardinghouse.features.rooms;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillingReceiptRepository extends JpaRepository<BillingReceipt, Long> {
    List<BillingReceipt> findByRoomId(Long roomId);
    List<BillingReceipt> findByOccupant(User occupant);
}
