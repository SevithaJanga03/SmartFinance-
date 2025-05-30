package com.smartfinance.controller;

import com.smartfinance.dto.AuthRequest;

import java.util.*;

import com.smartfinance.dto.AuthResponse;
import com.smartfinance.model.User;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.JwtUtil;
import com.smartfinance.service.UserService;
import com.smartfinance.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.AuthenticationException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // ✅ Register a new user
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // ✅ Login and return JWT token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        User user = userService.login(request.getEmail(), request.getPassword());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());


        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("name", user.getFullName());
        response.put("email", user.getEmail());
        return ResponseEntity.ok(response);
    }


    @GetMapping("/dashboard")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {
        try {
            String token = jwtUtil.resolveToken(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");
            }

            String email = jwtUtil.extractUsername(token);
            if (!jwtUtil.validateToken(token, email)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            Double totalIncome = transactionRepository.getTotalIncome(user);
            Double totalExpenses = transactionRepository.getTotalExpenses(user);
            if (totalIncome == null) totalIncome = 0.0;
            if (totalExpenses == null) totalExpenses = 0.0;
            Double balance = totalIncome - totalExpenses;

            // 1️⃣ Income by category
            List<Object[]> incomeByCategoryData = transactionRepository.getCategoryTotalsByType(user, "INCOME");
            Map<String, Double> incomeByCategory = new HashMap<>();
            for (Object[] row : incomeByCategoryData) {
                incomeByCategory.put((String) row[0], (Double) row[1]);
            }

            // 2️⃣ Expenses by category
            List<Object[]> expensesByCategoryData = transactionRepository.getCategoryTotalsByType(user, "EXPENSE");
            Map<String, Double> expensesByCategory = new HashMap<>();
            for (Object[] row : expensesByCategoryData) {
                expensesByCategory.put((String) row[0], (Double) row[1]);
            }

            // 3️⃣ Last 6 months data
            List<Object[]> lastSixMonthsData = transactionRepository.getMonthlyTotals(user.getId());
            Map<String, Map<String, Double>> lastSixMonths = new LinkedHashMap<>();
            for (Object[] row : lastSixMonthsData) {
                String month = (String) row[0];
                String type = (String) row[1];
                Double amount = (Double) row[2];
                lastSixMonths.putIfAbsent(month, new HashMap<>());
                lastSixMonths.get(month).put(type.toLowerCase(), amount);
            }

            // Response JSON
            Map<String, Object> response = new HashMap<>();
            response.put("summary", Map.of(
                    "balance", balance,
                    "income", totalIncome,
                    "expenses", totalExpenses
            ));
            response.put("incomeByCategory", incomeByCategory);
            response.put("expensesByCategory", expensesByCategory);
            response.put("lastSixMonths", lastSixMonths);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching dashboard");
        }
    }
}

