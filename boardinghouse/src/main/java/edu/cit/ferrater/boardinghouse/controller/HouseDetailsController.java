package edu.cit.ferrater.boardinghouse.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import edu.cit.ferrater.boardinghouse.entity.HouseDetails;
import edu.cit.ferrater.boardinghouse.service.HouseDetailsService;

@RestController
@RequestMapping("/api/houses")
@CrossOrigin(origins = "*")
public class HouseDetailsController {

    private final HouseDetailsService service;

    public HouseDetailsController(HouseDetailsService service) {
        this.service = service;
    }

    @GetMapping
    public List<HouseDetails> getAll() {
        return service.getAll();
    }
}