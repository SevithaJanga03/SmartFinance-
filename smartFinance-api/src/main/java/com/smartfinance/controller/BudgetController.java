package com.smartfinance.controller;

import com.smartfinance.dto.BudgetWithExpenses;
import com.smartfinance.model.Budget;
import com.smartfinance.model.User;
import com.smartfinance.repository.BudgetRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // ✅ Create Budget - assign logged-in user automatically
    @PostMapping
    public Budget createBudget(@RequestBody Budget budget, Principal principal) {
        String userEmail = principal.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        budget.setUser(user); // ✅ set full User object!
        return budgetRepository.save(budget);
    }

    // ✅ Get Budgets for the logged-in user
    @GetMapping
    public List<Budget> getBudgets(Principal principal) {
        String userEmail = principal.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return budgetRepository.findByUser(user);
    }

    // ✅ Budget Summary for the logged-in user
    @GetMapping("/summary")
    public BudgetSummary getBudgetSummary(Principal principal) {
        String userEmail = principal.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Budget> budgets = budgetRepository.findByUser(user);

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalUsed = BigDecimal.ZERO;

        for (Budget budget : budgets) {
            // Add to total budget
            totalBudget = totalBudget.add(budget.getBudgetLimit() != null ? budget.getBudgetLimit() : BigDecimal.ZERO);

            // Sum actual expenses for this category and date range
            BigDecimal used = transactionRepository.sumExpensesForCategoryAndDateRange(
                    user,
                    budget.getCategory(),
                    budget.getStartDate(),
                    budget.getEndDate()
            );

            if (used != null) {
                totalUsed = totalUsed.add(used);
            }
        }

        BigDecimal totalLeft = totalBudget.subtract(totalUsed);

        return new BudgetSummary(totalBudget, totalUsed, totalLeft);
    }


    // ✅ Update Budget
    @PutMapping("/{id}")
    public Budget updateBudget(@PathVariable Long id, @RequestBody Budget budgetDetails, Principal principal) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        // Optional: Validate if this budget belongs to the logged-in user
        // e.g. if (!budget.getUser().getEmail().equals(principal.getName())) throw ...

        budget.setCategory(budgetDetails.getCategory());
        budget.setBudgetLimit(budgetDetails.getBudgetLimit());
        budget.setStartDate(budgetDetails.getStartDate());
        budget.setEndDate(budgetDetails.getEndDate());
        return budgetRepository.save(budget);
    }

    // ✅ Delete Budget
    @DeleteMapping("/{id}")
    public void deleteBudget(@PathVariable Long id, Principal principal) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        // Optional: Validate if this budget belongs to the logged-in user

        budgetRepository.deleteById(id);
    }

    // ✅ Inner class for summary
    public static class BudgetSummary {
        private BigDecimal totalBudget;
        private BigDecimal totalUsed;
        private BigDecimal totalLeft;

        public BudgetSummary(BigDecimal totalBudget, BigDecimal totalUsed, BigDecimal totalLeft) {
            this.totalBudget = totalBudget;
            this.totalUsed = totalUsed;
            this.totalLeft = totalLeft;
        }

        public BigDecimal getTotalBudget() { return totalBudget; }
        public BigDecimal getTotalUsed() { return totalUsed; }
        public BigDecimal getTotalLeft() { return totalLeft; }
    }

    @GetMapping("/with-expenses")
    public List<BudgetWithExpenses> getBudgetsWithExpenses(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        // Fix: Use findByUser instead of findByUserId
        List<Budget> budgets = budgetRepository.findByUser(user);
        List<BudgetWithExpenses> result = new ArrayList<>();

        for (Budget budget : budgets) {
            // Sum of transactions for this category & date range
            BigDecimal totalExpenses = transactionRepository.sumExpensesForCategoryAndDateRange(
                    user, budget.getCategory(), budget.getStartDate(), budget.getEndDate()
            );
            if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

            result.add(new BudgetWithExpenses(
                    budget.getId(),
                    budget.getCategory(),
                    budget.getBudgetLimit(),
                    totalExpenses,
                    budget.getStartDate(),
                    budget.getEndDate()
            ));
        }

        return result;
    }
}
