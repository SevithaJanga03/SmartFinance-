package com.smartfinance.dto;

public class TransactionDTO {
    private Long id;
    private Double amount;
    private String category;
    private String description;
    private String date;
    private String type;
    private Long accountId; // 💡 New field to link to Account
    private String accountName;
    private Long goalId;



    // Getters and Setters

    public Long getGoalId() { return goalId; }

    public void setGoalId(Long goalId) { this.goalId = goalId; }

    public Double getAmount() {
        return amount;
    }
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }

    // 👇 Getter and Setter for accountId
    public Long getAccountId() {
        return accountId;
    }
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
    public String getAccountName() {
        return accountName;
    }
    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
