package com.smartfinance.repository;

import com.smartfinance.model.Goal;
import com.smartfinance.model.Transaction;
import com.smartfinance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);

    List<Transaction> findByGoal(Goal goal);

    long countByGoal(Goal goal);

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

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.account.id = :accountId AND t.type = 'INCOME'")
    Double getTotalIncomeForAccount(@Param("accountId") Long accountId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.account.id = :accountId AND t.type = 'EXPENSE'")
    Double getTotalExpensesForAccount(@Param("accountId") Long accountId);

    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.user = :user")
    List<String> findDistinctCategoriesByUser(@Param("user") User user);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.category = :category AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesForCategoryAndDateRange(@Param("user") User user,
                                                  @Param("category") String category,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT DISTINCT FUNCTION('DATE_FORMAT', t.date, '%Y-%m') FROM Transaction t WHERE t.user.id = :userId")
    List<String> findDistinctMonths(@Param("userId") Long userId);

    @Query("SELECT new map(t.category as category, SUM(t.amount) as amount) " +
            "FROM Transaction t WHERE t.user.id = :userId AND FUNCTION('DATE_FORMAT', t.date, '%Y-%m') = :month AND t.type = :type " +
            "GROUP BY t.category")
    List<Map<String, Object>> sumByCategory(@Param("userId") Long userId, @Param("month") String month, @Param("type") String type);

    @Query("SELECT new map(FUNCTION('DATE_FORMAT', t.date, '%Y-%m') as month, " +
            "SUM(CASE WHEN t.type='INCOME' THEN t.amount ELSE 0 END) as income, " +
            "SUM(CASE WHEN t.type='EXPENSE' THEN t.amount ELSE 0 END) as expense) " +
            "FROM Transaction t WHERE t.user.id = :userId GROUP BY month ORDER BY month")
    List<Map<String, Object>> getMonthlyBalanceTrend(@Param("userId") Long userId);

    @Query("SELECT new map(t.category as category, SUM(t.amount) as amount) " +
            "FROM Transaction t WHERE t.user.id = :userId AND FUNCTION('DATE_FORMAT', t.date, '%Y-%m') = :month AND t.type='EXPENSE' " +
            "GROUP BY t.category ORDER BY amount DESC")
    List<Map<String, Object>> getTopExpenses(@Param("userId") Long userId, @Param("month") String month);

    @Query("SELECT new map(FUNCTION('DATE_FORMAT', t.date, '%Y-%m') as month, " +
            "(SUM(CASE WHEN t.type='INCOME' THEN t.amount ELSE 0 END) - SUM(CASE WHEN t.type='EXPENSE' THEN t.amount ELSE 0 END)) / SUM(CASE WHEN t.type='INCOME' THEN t.amount ELSE 0 END) * 100 as savingsRate) " +
            "FROM Transaction t WHERE t.user.id = :userId GROUP BY month ORDER BY month")
    List<Map<String, Object>> getSavingsRate(@Param("userId") Long userId);

    @Query("SELECT new map(FUNCTION('DATE_FORMAT', t.date, '%Y-%m') as month, " +
            "SUM(CASE WHEN t.type='INCOME' THEN t.amount ELSE -t.amount END) as netWorth) " +
            "FROM Transaction t WHERE t.user.id = :userId GROUP BY month ORDER BY month")
    List<Map<String, Object>> getNetWorth(@Param("userId") Long userId);

    List<Transaction> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);

        @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.type = :type AND FUNCTION('DATE_FORMAT', t.date, '%Y-%m') = :month")
    List<Transaction> findByUserAndTypeAndMonth(@Param("user") User user, @Param("type") String type, @Param("month") String month);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.goal.id = :goalId AND t.user = :user")
    Double sumExpensesForGoal(@Param("goalId") Long goalId, @Param("user") User user);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.goal.id = :goalId AND t.user = :user AND t.date <= :targetDate")
    Double sumExpensesForGoalWithinDate(@Param("goalId") Long goalId, @Param("user") User user, @Param("targetDate") LocalDate targetDate);

}
