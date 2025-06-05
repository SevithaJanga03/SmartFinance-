package com.smartfinance.controller;

import com.smartfinance.dto.TransactionDTO;
import com.smartfinance.model.Account;
import com.smartfinance.model.Goal;
import com.smartfinance.model.Transaction;
import com.smartfinance.model.User;
import com.smartfinance.repository.AccountRepository;
import com.smartfinance.repository.GoalRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
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
    private GoalRepository goalRepository;

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

        LocalDate parsedDate = LocalDate.parse(dto.getDate());

        Transaction transaction = new Transaction();
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(parsedDate);
        transaction.setType(dto.getType());
        transaction.setUser(user);
        transaction.setAccount(account);

        // ➡️ If linked to a goal
        if (dto.getGoalId() != null) {
            Goal goal = goalRepository.findById(dto.getGoalId())
                    .orElseThrow(() -> new RuntimeException("Goal not found"));

            // Update goal’s current amount
            double updatedAmount = goal.getCurrentAmount() + dto.getAmount();
            goal.setCurrentAmount(updatedAmount);
            goalRepository.save(goal);

            // Link transaction to goal
            transaction.setGoal(goal);
        }

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
            dto.setDate(t.getDate().toString());
            dto.setType(t.getType());
            dto.setAccountId(t.getAccount() != null ? t.getAccount().getId() : null);
            dto.setAccountName(t.getAccount() != null ? t.getAccount().getName() : "");
            // Also include goalId if present
            dto.setGoalId(t.getGoal() != null ? t.getGoal().getId() : null);
            return dto;
        }).toList();

        return ResponseEntity.ok(dtoList);
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

        Account account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        LocalDate parsedDate = LocalDate.parse(dto.getDate());

        // Fetch the linked goal from DB
        Goal linkedGoal = transaction.getGoal();

        boolean categoryChanged = !dto.getCategory().equalsIgnoreCase(transaction.getCategory());
        boolean amountChanged = !dto.getAmount().equals(transaction.getAmount());

        if (linkedGoal != null) {
            // If category changed and it's no longer a goal category
            if (categoryChanged && !dto.getCategory().equalsIgnoreCase("Goal")) {
                // Remove goal link and subtract transaction amount from goal
                linkedGoal.setCurrentAmount(linkedGoal.getCurrentAmount() - transaction.getAmount());
                goalRepository.save(linkedGoal);
                transaction.setGoal(null);
            }
            // If amount changed and still in goal category
            else if (amountChanged && dto.getCategory().equalsIgnoreCase("Goal")) {
                double difference = dto.getAmount() - transaction.getAmount();
                linkedGoal.setCurrentAmount(linkedGoal.getCurrentAmount() + difference);
                goalRepository.save(linkedGoal);
            }
        }

        // Update transaction fields
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(parsedDate);
        transaction.setType(dto.getType());
        transaction.setAccount(account);

        transactionRepository.save(transaction);
        return ResponseEntity.ok("Transaction updated successfully!");
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

        // If linked to a goal, subtract the amount from the goal's currentAmount
        if (transaction.getGoal() != null) {
            Goal goal = transaction.getGoal();
            goal.setCurrentAmount(goal.getCurrentAmount() - transaction.getAmount());
            goalRepository.save(goal);
        }

        transactionRepository.delete(transaction);
        return ResponseEntity.ok("Transaction deleted successfully!");
    }

    @GetMapping("/categories")
    public List<String> getDistinctCategories(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return transactionRepository.findDistinctCategoriesByUser(user);
    }
}
