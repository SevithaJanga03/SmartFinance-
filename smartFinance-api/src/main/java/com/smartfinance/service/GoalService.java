package com.smartfinance.service;

import com.smartfinance.dto.GoalSummaryDTO;
import com.smartfinance.model.Goal;
import com.smartfinance.model.User;
import java.util.List;

public interface GoalService {
    List<Goal> getGoals(User user);
    Goal createGoal(User user, Goal goal);
    Goal updateGoal(User user, Long goalId, Goal updatedGoal);
    String deleteGoal(User user, Long goalId);

    // ✅ New!
    List<GoalSummaryDTO> getGoalSummaries(User user);
}
