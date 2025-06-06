package com.smartfinance.repository;

import com.smartfinance.model.Goal;
import com.smartfinance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUser(User user);
}
