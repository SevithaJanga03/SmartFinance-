package com.smartfinance.service;

import com.smartfinance.model.Goal;
import com.smartfinance.model.User;
import com.smartfinance.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GoalServiceImpl implements GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Override
    public List<Goal> getGoals(User user) {
        return goalRepository.findByUser(user);
    }

    @Override
    public Goal createGoal(User user, Goal goal) {
        goal.setUser(user);
        goal.setCurrentAmount(0.0); // Initialize
        return goalRepository.save(goal);
    }

    @Override
    public Goal updateGoal(User user, Long goalId, Goal updatedGoal) {
        Goal existingGoal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!existingGoal.getUser().equals(user)) {
            throw new RuntimeException("Unauthorized");
        }
        existingGoal.setCurrentAmount(updatedGoal.getCurrentAmount());
        return goalRepository.save(existingGoal);
    }

    @Override
    public void deleteGoal(User user, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().equals(user)) {
            throw new RuntimeException("Unauthorized");
        }
        goalRepository.delete(goal);
    }
}
