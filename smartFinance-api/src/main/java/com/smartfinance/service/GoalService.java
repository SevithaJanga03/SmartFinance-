package com.smartfinance.service;

import com.smartfinance.model.Goal;
import com.smartfinance.model.User;
import java.util.List;

public interface GoalService {
    List<Goal> getGoals(User user);
    Goal createGoal(User user, Goal goal);
    Goal updateGoal(User user, Long goalId, Goal updatedGoal);
    void deleteGoal(User user, Long goalId);
}
