package com.smartfinance.dto;

import com.smartfinance.model.Account;

public class AccountSummaryDTO {
    private Long id;
    private String name;
    private String type;
    private Double totalIncome;
    private Double totalExpenses;
    private Double balance;

    // constructor
    public AccountSummaryDTO(Account account, Double income, Double expenses, Double balance) {
        this.id = account.getId();
        this.name = account.getName();
        this.type = account.getType();
        this.totalIncome = income;
        this.totalExpenses = expenses;
        this.balance = balance;
    }

    // getters & setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(Double totalIncome) {
        this.totalIncome = totalIncome;
    }

    public Double getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(Double totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }
}
