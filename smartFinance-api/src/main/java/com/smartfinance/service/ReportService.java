package com.smartfinance.service;

import com.smartfinance.model.Transaction;
import com.smartfinance.model.User;
import com.smartfinance.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepo;


    public Double getIncomeSummaryTotal(User user, String month) {
        // Example: sum of income transactions for the given month
        return transactionRepo
                .findByUserAndTypeAndMonth(user, "INCOME", month)
                .stream()
                .mapToDouble(Transaction::getAmount)
                .sum();
    }


    public Double getExpenseSummaryTotal(User user, String month) {
        // Example: sum of expense transactions for the given month
        return transactionRepo
                .findByUserAndTypeAndMonth(user, "EXPENSE", month)
                .stream()
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    public List<String> getAvailableMonths(User user) {
        return transactionRepo.findDistinctMonths(user.getId());
    }

    public List<Map<String, Object>> getIncomeSummary(User user, String month) {
        return transactionRepo.sumByCategory(user.getId(), month, "INCOME");
    }

    public List<Map<String, Object>> getExpenseSummary(User user, String month) {
        return transactionRepo.sumByCategory(user.getId(), month, "EXPENSE");
    }

    public List<Map<String, Object>> getMonthlyBalanceTrend(User user) {
        return transactionRepo.getMonthlyBalanceTrend(user.getId());
    }

    public List<Map<String, Object>> getTopExpenses(User user, String month) {
        return transactionRepo.getTopExpenses(user.getId(), month);
    }

    public List<Map<String, Object>> getSavingsRate(User user) {
        return transactionRepo.getSavingsRate(user.getId());
    }

    public List<Map<String, Object>> getNetWorth(User user) {
        return transactionRepo.getNetWorth(user.getId());
    }

    public List<Map<String, Object>> getGoals(User user) {
        // dummy data
        return List.of(
                Map.of("goal", "Emergency Fund", "target", 2000, "actual", 1500),
                Map.of("goal", "Vacation", "target", 3000, "actual", 1200)
        );
    }

    public List<Transaction> getTransactionsForCsv(User user, String month) {
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        return transactionRepo.findByUserAndDateBetween(user, start, end);
    }
}
