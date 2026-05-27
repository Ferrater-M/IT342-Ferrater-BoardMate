package edu.cit.ferrater.boardinghouse.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }

    public UserNotFoundException() {
        super("UserNotFoundException");
    }
}