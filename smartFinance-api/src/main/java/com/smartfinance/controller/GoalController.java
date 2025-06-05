package com.smartfinance.controller;

import com.smartfinance.dto.GoalSummaryDTO;
import com.smartfinance.model.Goal;
import com.smartfinance.model.User;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:3000")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Goal> getGoals(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return goalService.getGoals(user);
    }

    @PostMapping
    public Goal createGoal(@RequestBody Goal goal, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return goalService.createGoal(user, goal);
    }

    @PutMapping("/{id}")
    public Goal updateGoal(@PathVariable Long id, @RequestBody Goal goal, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return goalService.updateGoal(user, id, goal);
    }

    @DeleteMapping("/{id}")
    public String deleteGoal(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return goalService.deleteGoal(user, id);
    }

    // ✅ New summary endpoint!
    @GetMapping("/summary")
    public List<GoalSummaryDTO> getGoalSummaries(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return goalService.getGoalSummaries(user);
    }
}
