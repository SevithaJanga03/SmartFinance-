package com.smartfinance.controller;

import com.smartfinance.dto.TransactionDTO;
import com.smartfinance.model.Account;
import com.smartfinance.model.Transaction;
import com.smartfinance.model.User;
import com.smartfinance.repository.AccountRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;   // ✅ Import LocalDate
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
    private AccountRepository accountRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> addTransaction(@RequestBody TransactionDTO dto,
                                            @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Convert String date to LocalDate
        LocalDate parsedDate = LocalDate.parse(dto.getDate());  // ✅ Fix

        // Create and save transaction
        Transaction transaction = new Transaction();
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(parsedDate);  // ✅ Use LocalDate
        transaction.setType(dto.getType());
        transaction.setUser(user);
        transaction.setAccount(account);

        transactionRepository.save(transaction);

        return ResponseEntity.ok("Transaction saved successfully!");
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getTransactions(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUser(user);

        List<TransactionDTO> dtoList = transactions.stream().map(t -> {
            TransactionDTO dto = new TransactionDTO();
            dto.setId(t.getId());
            dto.setAmount(t.getAmount());
            dto.setCategory(t.getCategory());
            dto.setDescription(t.getDescription());
            dto.setDate(t.getDate().toString());   // ✅ Send as String
            dto.setType(t.getType());
            dto.setAccountId(t.getAccount() != null ? t.getAccount().getId() : null);
            dto.setAccountName(t.getAccount() != null ? t.getAccount().getName() : "");
            return dto;
        }).toList();

        return ResponseEntity.ok(dtoList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id,
                                               @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are not authorized to delete this transaction.");
        }

        transactionRepository.delete(transaction);
        return ResponseEntity.ok("Transaction deleted successfully!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id,
                                               @RequestBody TransactionDTO dto,
                                               @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are not authorized to update this transaction.");
        }

        if (dto.getAccountId() != null) {
            Account account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            transaction.setAccount(account);
        }

        // Convert String date to LocalDate
        LocalDate parsedDate = LocalDate.parse(dto.getDate());  // ✅ Fix

        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(parsedDate);   // ✅ Use LocalDate
        transaction.setType(dto.getType());

        transactionRepository.save(transaction);
        return ResponseEntity.ok("Transaction updated successfully!");
    }

    @GetMapping("/categories")
    public List<String> getDistinctCategories(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return transactionRepository.findDistinctCategoriesByUser(user);
    }
}
