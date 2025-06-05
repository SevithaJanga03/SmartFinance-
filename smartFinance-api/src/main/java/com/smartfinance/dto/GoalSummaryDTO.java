package com.smartfinance.dto;

public class GoalSummaryDTO {
    private Long goalId;
    private String goalName;
    private Double targetAmount;
    private Double usedAmount;
    private Double leftAmount;

    public GoalSummaryDTO(Long goalId, String goalName, Double targetAmount,
                          Double usedAmount, Double leftAmount) {
        this.goalId = goalId;
        this.goalName = goalName;
        this.targetAmount = targetAmount;
        this.usedAmount = usedAmount;
        this.leftAmount = leftAmount;
    }

    // Getters
    public Long getGoalId() { return goalId; }
    public String getGoalName() { return goalName; }
    public Double getTargetAmount() { return targetAmount; }
    public Double getUsedAmount() { return usedAmount; }
    public Double getLeftAmount() { return leftAmount; }
}
