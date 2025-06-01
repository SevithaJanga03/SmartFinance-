package com.smartfinance.controller;

import com.smartfinance.model.Account;
import com.smartfinance.model.User;
import com.smartfinance.repository.AccountRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import com.smartfinance.dto.AccountSummaryDTO;
import java.util.stream.Collectors;
import java.util.*;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:3000")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TransactionRepository transactionRepository;

    // Get all accounts for current user
    @GetMapping
    public ResponseEntity<List<Account>> getAccounts(HttpServletRequest request) {
        String email = extractUserEmail(request);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Account> accounts = accountRepository.findByUser(user);
        return ResponseEntity.ok(accounts);
    }

    // Create a new account
    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account, HttpServletRequest request) {
        String email = extractUserEmail(request);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        account.setUser(user);
        Account saved = accountRepository.save(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Update an account
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(@PathVariable Long id, @RequestBody Account updatedAccount, HttpServletRequest request) {
        String email = extractUserEmail(request);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Account existing = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        if (!existing.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        existing.setName(updatedAccount.getName());
        existing.setType(updatedAccount.getType());
        accountRepository.save(existing);

        return ResponseEntity.ok(existing);
    }

    // Delete an account
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id, HttpServletRequest request) {
        String email = extractUserEmail(request);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        try {
            accountRepository.delete(account);
            return ResponseEntity.ok("Account deleted");
        } catch (DataIntegrityViolationException e) {
            // Foreign key constraint violation occurred
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Cannot delete this account because it has transactions linked to it.");
        }

    }

    @GetMapping("/summary")
    public ResponseEntity<List<AccountSummaryDTO>> getAccountsWithSummary(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Account> accounts = accountRepository.findByUser(user);

        List<AccountSummaryDTO> summaryList = accounts.stream().map(account -> {
            Double income = transactionRepository.getTotalIncomeForAccount(account.getId());
            Double expenses = transactionRepository.getTotalExpensesForAccount(account.getId());
            Double balance = income - expenses;

            return new AccountSummaryDTO(account, income, expenses, balance);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(summaryList);
    }

    private String extractUserEmail(HttpServletRequest request) {
        String token = jwtUtil.resolveToken(request);
        if (token == null) throw new RuntimeException("Missing token");
        String email = jwtUtil.extractUsername(token);
        if (!jwtUtil.validateToken(token, email)) throw new RuntimeException("Invalid token");
        return email;
    }
}
