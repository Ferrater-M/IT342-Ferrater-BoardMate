package edu.cit.ferrater.boardinghouse.features.rooms;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing_receipts")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BillingReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomNumber;
    private String billingDate; // The date picked from calendar
    private String price;
    private String inclusions; // SNAPSHOT of necessities Name:Price,Name:Price
    private String totalAmount;
    private String paymentStatus;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User occupant; // Who paid it
}
