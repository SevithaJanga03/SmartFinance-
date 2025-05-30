package com.smartfinance.controller;

import com.smartfinance.dto.TransactionDTO;
import com.smartfinance.model.Transaction;
import com.smartfinance.model.User;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> addTransaction(@RequestBody TransactionDTO dto,
                                            @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7)); // Remove "Bearer "
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(dto.getDate());
        transaction.setType(dto.getType());
        transaction.setUser(user);

        transactionRepository.save(transaction);

        return ResponseEntity.ok("Transaction saved successfully");
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Transaction> transactions = transactionRepository.findByUser(user);
        return ResponseEntity.ok(transactions);
    }
}
