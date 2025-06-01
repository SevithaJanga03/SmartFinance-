package com.smartfinance.controller;

import com.smartfinance.model.Transaction;
import com.smartfinance.model.User;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.service.ReportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReportService reportService;

    /**
     * Download CSV report of all transactions.
     */
    @GetMapping("/transactions/csv")
    public void generateCsvReport(HttpServletResponse response, Principal principal) throws Exception {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<Transaction> transactions = transactionRepository.findByUser(user);

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Date,Category,Amount,Type,Description\n");
        for (Transaction t : transactions) {
            csvBuilder.append(String.format("%s,%s,%.2f,%s,%s\n",
                    t.getDate(), t.getCategory(), t.getAmount(), t.getType(), t.getDescription()));
        }

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=financial_report.csv");
        response.getWriter().write(csvBuilder.toString());
    }

    /**
     * Download PDF report (example placeholder).
     */
    @GetMapping("/summary/pdf")
    public void generatePdfReport(HttpServletResponse response, Principal principal) throws Exception {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<Transaction> transactions = transactionRepository.findByUser(user);

        ByteArrayOutputStream pdfOutput = new ByteArrayOutputStream();
        // Use iText to generate PDF
        // e.g., PdfGenerator.createReport(transactions, pdfOutput);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=financial_report.pdf");
        response.getOutputStream().write(pdfOutput.toByteArray());
    }

    /**
     * List of months available for reporting.
     */
    @GetMapping("/available-months")
    public List<String> getAvailableMonths(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getAvailableMonths(user);
    }

    /**
     * Aggregator endpoint for a selected month.
     */
    @GetMapping("/monthly-data")
    public Map<String, Object> getMonthlyData(@RequestParam String month, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();

        Map<String, Object> response = new HashMap<>();
        // Summary data
        response.put("incomeByCategory", reportService.getIncomeSummary(user, month));
        response.put("expensesByCategory", reportService.getExpenseSummary(user, month));
        response.put("topExpenses", reportService.getTopExpenses(user, month));
        response.put("last6Months", reportService.getMonthlyBalanceTrend(user));

        // Compute total income and expenses
        Double totalIncome = reportService.getIncomeSummaryTotal(user, month);
        Double totalExpenses = reportService.getExpenseSummaryTotal(user, month);

        response.put("totalIncome", totalIncome);
        response.put("totalExpenses", totalExpenses);

        // Expense vs Income ratio (or other metrics)
        Map<String, Double> expenseVsIncome = new HashMap<>();
        expenseVsIncome.put("income", totalIncome);
        expenseVsIncome.put("expenses", totalExpenses);
        response.put("expenseVsIncome", expenseVsIncome);

        return response;
    }

    /**
     * Additional endpoints (optional, if you want to keep them for standalone usage).
     */
    @GetMapping("/income-summary")
    public List<Map<String, Object>> getIncomeSummary(@RequestParam String month, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getIncomeSummary(user, month);
    }

    @GetMapping("/expense-summary")
    public List<Map<String, Object>> getExpenseSummary(@RequestParam String month, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getExpenseSummary(user, month);
    }

    @GetMapping("/monthly-balance-trend")
    public List<Map<String, Object>> getMonthlyBalanceTrend(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getMonthlyBalanceTrend(user);
    }

    @GetMapping("/top-expenses")
    public List<Map<String, Object>> getTopExpenses(@RequestParam String month, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getTopExpenses(user, month);
    }

    @GetMapping("/savings-rate")
    public List<Map<String, Object>> getSavingsRate(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getSavingsRate(user);
    }

    @GetMapping("/net-worth")
    public List<Map<String, Object>> getNetWorth(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getNetWorth(user);
    }

    @GetMapping("/goals")
    public List<Map<String, Object>> getGoals(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getGoals(user);
    }

    @GetMapping("/transactions")
    public List<Transaction> getTransactionsForCsv(@RequestParam String month, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return reportService.getTransactionsForCsv(user, month);
    }
}
