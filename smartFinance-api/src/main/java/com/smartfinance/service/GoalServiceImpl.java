package com.smartfinance.service;

import com.smartfinance.dto.GoalSummaryDTO;
import com.smartfinance.model.Goal;
import com.smartfinance.model.User;
import com.smartfinance.repository.GoalRepository;
import com.smartfinance.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class GoalServiceImpl implements GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private TransactionRepository transactionRepository;

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
    public String deleteGoal(User user, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));
        if (!goal.getUser().equals(user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        // Check if there are linked transactions
        long linkedTransactionCount = transactionRepository.countByGoal(goal);
        if (linkedTransactionCount > 0) {
            // Instead of throwing an error, return a message
            return "Cannot delete goal: linked transactions exist.";
        }

        goalRepository.delete(goal);
        return "Goal deleted successfully!";
    }

    // ✅ New!
    @Override
    public List<GoalSummaryDTO> getGoalSummaries(User user) {
        List<Goal> goals = goalRepository.findByUser(user);
        List<GoalSummaryDTO> summaries = new ArrayList<>();

        for (Goal goal : goals) {
            // ✅ Sum only transactions that are linked to this goal and within the target date
            Double usedAmount = transactionRepository.sumExpensesForGoalWithinDate(goal.getId(), user, goal.getTargetDate());
            if (usedAmount == null) usedAmount = 0.0;

            Double leftAmount = goal.getTargetAmount() - usedAmount;

            summaries.add(new GoalSummaryDTO(
                    goal.getId(),
                    goal.getName(),
                    goal.getTargetAmount(),
                    usedAmount,
                    leftAmount
            ));
        }

        return summaries;
    }

}
