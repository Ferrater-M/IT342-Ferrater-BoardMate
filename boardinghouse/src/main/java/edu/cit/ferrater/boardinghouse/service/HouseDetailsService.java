package edu.cit.ferrater.boardinghouse.service;

import edu.cit.ferrater.boardinghouse.entity.HouseDetails;
import edu.cit.ferrater.boardinghouse.repository.HouseDetailsRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HouseDetailsService {

    private final HouseDetailsRepository repo;

    public HouseDetailsService(HouseDetailsRepository repo) {
        this.repo = repo;
    }

    public List<HouseDetails> getAll() {
        return repo.findAll();
    }
}