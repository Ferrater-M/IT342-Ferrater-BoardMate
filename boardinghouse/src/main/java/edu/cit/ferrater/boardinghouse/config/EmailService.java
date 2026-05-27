package edu.cit.ferrater.boardinghouse.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service    
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        try {
            String verifyLink = frontendUrl + "/verify-email?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Verify your BoardMate email");
            message.setText("Click the link below to verify your email:\n\n" + verifyLink
                    + "\n\nThis link is valid for 24 hours.");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send verification email to " + toEmail + ": " + e.getMessage());
        }
    }
}
