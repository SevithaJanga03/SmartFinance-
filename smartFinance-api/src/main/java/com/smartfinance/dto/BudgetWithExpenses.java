package com.smartfinance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BudgetWithExpenses {
    private Long id;
    private String category;
    private BigDecimal budgetLimit;
    private BigDecimal used;
    private LocalDate startDate;
    private LocalDate endDate;

    public BudgetWithExpenses() {
    }

    public BudgetWithExpenses(Long id, String category, BigDecimal budgetLimit,
                              BigDecimal used, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.category = category;
        this.budgetLimit = budgetLimit;
        this.used = used;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getBudgetLimit() {
        return budgetLimit;
    }

    public BigDecimal getUsed() {
        return used;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setBudgetLimit(BigDecimal budgetLimit) {
        this.budgetLimit = budgetLimit;
    }

    public void setUsed(BigDecimal used) {
        this.used = used;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
