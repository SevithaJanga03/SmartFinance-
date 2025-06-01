package com.smartfinance.repository;

import com.smartfinance.model.Account;
import com.smartfinance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    // Total income for an account
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.account.id = :accountId AND t.type = 'INCOME'")
    Double getTotalIncomeForAccount(@Param("accountId") Long accountId);

    // Total expenses for an account
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.account.id = :accountId AND t.type = 'EXPENSE'")
    Double getTotalExpensesForAccount(@Param("accountId") Long accountId);

}

