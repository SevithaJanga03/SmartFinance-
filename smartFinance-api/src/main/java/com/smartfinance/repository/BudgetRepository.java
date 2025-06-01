package com.smartfinance.repository;

import com.smartfinance.model.Budget;
import com.smartfinance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Fetch budgets for a specific user
    List<Budget> findByUser(User user);

}
