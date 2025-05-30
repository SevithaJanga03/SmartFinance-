package com.smartfinance.repository;

import com.smartfinance.model.Transaction;
import com.smartfinance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME'")
    Double getTotalIncome(User user);

    // Sum of all EXPENSE transactions
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE'")
    Double getTotalExpenses(User user);

    // 1️⃣ Income/Expense totals grouped by category
    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type GROUP BY t.category")
    List<Object[]> getCategoryTotalsByType(User user, String type);

    // 2️⃣ Income/Expense totals grouped by month for the last 6 months
    @Query(value = "SELECT DATE_FORMAT(STR_TO_DATE(t.date, '%Y-%m-%d'), '%M') AS month, " +
            "t.type, SUM(t.amount) " +
            "FROM transaction t " +
            "WHERE t.user_id = :userId " +
            "GROUP BY month, t.type " +
            "ORDER BY MIN(STR_TO_DATE(t.date, '%Y-%m-%d')) DESC", nativeQuery = true)
    List<Object[]> getMonthlyTotals(@Param("userId") Long userId);

}
