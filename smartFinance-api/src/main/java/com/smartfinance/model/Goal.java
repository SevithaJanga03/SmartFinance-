package com.smartfinance.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double targetAmount;
    private Double currentAmount;
    private LocalDate targetDate;

    @ManyToOne
    private User user;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getTargetAmount() { return targetAmount; }
    public void setTargetAmount(Double targetAmount) { this.targetAmount = targetAmount; }

    public Double getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(Double currentAmount) { this.currentAmount = currentAmount; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
