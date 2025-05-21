// Blog posts data
export const blogPosts = [
  {
    id: 1,
    title: 'Testing Website Color Themes on Code',
    date: '2025-04-30',
    author: 'Jon Prado',
    tags: ['workshop', 'robotics', 'education'],
    image: 'https://images.unsplash.com/photo-1625535163131-9d1fc30ea5f5?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dg',
    content: `Some things are unnecessary but fun. Arguibly this is one of those examples. However this website is all about innovation, self expression and having fun. In the future I envision this site to share all sorts of information and highlight different Makers. And one thing that will be highlighted is code. That is why I wanted to have different color schemes for users to toggle through to make the process of reading the code more enjoyable,

Here's a some AI generated examples of code blocks in various coding languages to test the color schemes.

  \`\`\`cpp
   // Single-line comment

/*
 * Multi-line comment
 * Demonstrating various syntax features in C++
 */

#include <iostream>
#include <vector>
#include <cmath>
#include <stdexcept>

#define PI 3.14159

const double CONSTANT_VALUE = 42.0;

class Circle {
private:
    double radius;

public:
    Circle(double r) : radius(r) {}

    double area() const {
        return PI * radius * radius;
    }

    std::string describe() const {
        return "Circle with radius " + std::to_string(radius);
    }
};

double divide(double a, double b) {
    if (b == 0) {
        throw std::runtime_error("Division by zero");
    }
    return a / b;
}

int main() {
    std::vector<Circle> circles = { Circle(1.0), Circle(3.0) };

    for (const auto& circle : circles) {
        std::cout << circle.describe() << std::endl;
        std::cout << "Area: " << circle.area() << std::endl;

        if (circle.area() > 20.0) {
            std::cout << "Large circle!" << std::endl;
        }
    }

    return 0;
}
\`\`\`

\`\`\`python
# Single-line comment

"""
Multi-line comment or docstring
Describes the purpose of the module
"""

import math
from typing import List, Optional

CONSTANT_VALUE = 42  # Constant declaration

class Circle:
    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        return math.pi * (self.radius ** 2)

    def describe(self) -> str:
        return f"A circle with radius {self.radius}"

def divide(a: float, b: float) -> Optional[float]:
    try:
        return a / b
    except ZeroDivisionError as e:
        print(f"Error: {e}")
        return None

def main():
    shapes: List[Circle] = [Circle(r) for r in range(1, 4)]
    
    for shape in shapes:
        print(shape.describe())
        if shape.radius > 2:
            print("Large circle!")
        else:
            print("Small circle.")

    result = divide(10, 0)
    if result is None:
        print("Division failed.")
    else:
        print(f"Result: {result:.2f}")

if __name__ == "__main__":
    main()
\`\`\`

\`\`\`javascript
// Single-line comment

/**
 * Multi-line comment describing the file or function
 */

const PI = 3.14159;

class Circle {
  constructor(radius) {
    this.radius = radius;
  }

  area() {
    return PI * this.radius ** 2;
  }

  describe() {
    return \`Circle with radius \${this.radius}\`;
  }
}

function divide(a, b) {
  try {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  } catch (e) {
    console.error(e.message);
    return null;
  }
}

const circles = [new Circle(1), new Circle(3)];
circles.forEach((c) => {
  console.log(c.describe());
  console.log(\`Area: \${c.area()}\`);
});

const result = divide(10, 0);
console.log(result ?? "No result");
\`\`\`

\`\`\`java
// Single-line comment

/*
 * Multi-line comment
 * explaining what the class does
 */

import java.util.*;

public class CircleDemo {
    static final double PI = 3.14159;

    static class Circle {
        double radius;

        Circle(double radius) {
            this.radius = radius;
        }

        double area() {
            return PI * radius * radius;
        }

        String describe() {
            return "Circle with radius " + radius;
        }
    }

    static double divide(double a, double b) {
        try {
            return a / b;
        } catch (ArithmeticException e) {
            System.out.println("Error: " + e.getMessage());
            return 0;
        }
    }

    public static void main(String[] args) {
        List<Circle> circles = Arrays.asList(new Circle(1), new Circle(3));

        for (Circle c : circles) {
            System.out.println(c.describe());
            System.out.println("Area: " + c.area());
        }

        double result = divide(10, 0);
        System.out.println("Result: " + result);
    }
}
\`\`\`

\`\`\`c
// Single-line comment

/*
 Multi-line comment
 describing functionality
*/

using System;
using System.Collections.Generic;

class Circle {
    private const double PI = 3.14159;
    public double Radius { get; set; }

    public Circle(double radius) {
        Radius = radius;
    }

    public double Area() {
        return PI * Radius * Radius;
    }

    public string Describe() {
        return $"Circle with radius {Radius}";
    }
}

class Program {
    static double Divide(double a, double b) {
        try {
            return a / b;
        } catch (DivideByZeroException e) {
            Console.WriteLine($"Error: {e.Message}");
            return 0;
        }
    }

    static void Main() {
        List<Circle> circles = new List<Circle> { new Circle(1), new Circle(3) };

        foreach (var circle in circles) {
            Console.WriteLine(circle.Describe());
            Console.WriteLine($"Area: {circle.Area()}");
        }

        double result = Divide(10, 0);
        Console.WriteLine($"Result: {result}");
    }
}
\`\`\`

\`\`\`go
// Single-line comment

/*
Multi-line comment describing the program
*/

package main

import (
    "fmt"
)

const PI = 3.14159

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return PI * c.Radius * c.Radius
}

func divide(a, b float64) float64 {
    if b == 0 {
        fmt.Println("Error: Division by zero")
        return 0
    }
    return a / b
}

func main() {
    circles := []Circle{{1}, {3}}

    for _, c := range circles {
        fmt.Println("Circle with radius:", c.Radius)
        fmt.Printf("Area: %.2f\\n", c.Area())
    }

    result := divide(10, 0)
    fmt.Printf("Result: %.2f\\n", result)
}
\`\`\`

\`\`\`rust
// Single-line comment

/*
Multi-line comment
for describing the module
*/

const PI: f64 = 3.14159;

struct Circle {
    radius: f64,
}

impl Circle {
    fn area(&self) -> f64 {
        PI * self.radius.powi(2)
    }

    fn describe(&self) -> String {
        format!("Circle with radius {}", self.radius)
    }
}

fn divide(a: f64, b: f64) -> Option<f64> {
    if b == 0.0 {
        eprintln!("Cannot divide by zero");
        None
    } else {
        Some(a / b)
    }
}

fn main() {
    let circles = vec![Circle { radius: 1.0 }, Circle { radius: 3.0 }];
    for c in &circles {
        println!("{}", c.describe());
        println!("Area: {:.2}", c.area());
    }

    match divide(10.0, 0.0) {
        Some(result) => println!("Result: {:.2}", result),
        None => println!("Division failed."),
    }
}
\`\`\`

\`\`\`typescript
// Single-line comment

/**
 * Multi-line comment describing function/class
 */

const PI: number = 3.14159;

class Circle {
  constructor(public radius: number) {}

  area(): number {
    return PI * this.radius ** 2;
  }

  describe(): string {
    return \`Circle with radius \${this.radius}\`;
  }
}

function divide(a: number, b: number): number | null {
  try {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  } catch (e) {
    console.error((e as Error).message);
    return null;
  }
}

const shapes: Circle[] = [new Circle(1), new Circle(3)];
shapes.forEach((shape) => {
  console.log(shape.describe());
  console.log(\`Area: \${shape.area()}\`);
});

const result = divide(10, 0);
console.log(result ?? "No result");
\`\`\`

 \`\`\`ruby
# Single-line comment

=begin
Multi-line comment
Describing the Ruby script
=end

PI = 3.14159

class Circle
  attr_reader :radius

  def initialize(radius)
    @radius = radius
  end

  def area
    PI * @radius ** 2
  end

  def describe
    "Circle with radius #{@radius}"
  end
end

def divide(a, b)
  begin
    a / b
  rescue ZeroDivisionError => e
    puts "Error: #{e.message}"
    nil
  end
end

circles = [Circle.new(1), Circle.new(3)]
circles.each do |c|
  puts c.describe
  puts "Area: #{c.area}"
end

result = divide(10, 0)
puts "Result: #{result || 'No result'}"
\`\`\`

`,
    
},
  
  
  {
    id: 2,
    title: 'Successful Hackathon Event',
    date: '2024-01-10',
    author: 'Maria Santos',
    content: `Last weekend's hackathon was a huge success! Teams created amazing projects focusing on sustainable technology solutions.

    Over 100 participants formed 25 teams, working tirelessly for 48 hours to develop innovative solutions for environmental challenges. The projects ranged from smart recycling systems to renewable energy applications.

    Winning Projects:
    1. EcoSort - An AI-powered recycling system
    2. SolarSync - Smart solar panel optimization
    3. WaterWise - IoT-based water conservation

    The event featured workshops from industry experts and provided participants with valuable networking opportunities. We're already looking forward to next year's event!`,
    tags: ['event', 'hackathon', 'innovation'],
    image: 'https://images.pexels.com/photos/7096/people-woman-coffee-meeting.jpg'
  },
  {
    id: 3,
    title: 'Industry Partnership Announcement',
    date: '2024-01-05',
    author: 'Jon Prado',
    content: `We're excited to announce our new partnership with TechCorp, bringing more opportunities for our members!

    This partnership will provide:
    - Internship opportunities
    - Mentorship programs
    - Access to industry-standard equipment
    - Professional development workshops

    TechCorp is a leading technology company known for its innovative work in robotics and automation. This partnership represents a significant step forward in our mission to bridge the gap between education and industry.`,
    tags: ['partnership', 'industry', 'announcement'],
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg'
  },
  {
    id: 4,
    title: 'New Maker Space Opening',
    date: '2024-01-01',
    author: 'Maria Santos',
    content: `We're thrilled to announce the opening of our new maker space! Join us for the grand opening celebration.

    The new space features:
    - 3D printing lab
    - Electronics workstation
    - Woodworking area
    - Collaborative workspace
    - Meeting rooms
    
    Located in the heart of the city, our maker space is designed to foster innovation and creativity. Members will have 24/7 access to equipment and resources.

    Grand Opening Details:
    Date: January 15th, 2024
    Time: 10:00 AM - 4:00 PM
    Location: 123 Maker Street

    Join us for demonstrations, workshops, and refreshments!`,
    tags: ['event', 'makerspace', 'announcement'],
    image: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg'
  }
];