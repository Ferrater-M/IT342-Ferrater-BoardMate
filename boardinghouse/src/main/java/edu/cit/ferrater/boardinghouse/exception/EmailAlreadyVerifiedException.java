package edu.cit.ferrater.boardinghouse.exception;

public class EmailAlreadyVerifiedException extends RuntimeException {
    public EmailAlreadyVerifiedException(String message) {
        super(message);
    }

    public EmailAlreadyVerifiedException() {
        super("EmailAlreadyVerifiedException");
    }
}