# ROS 2 Basics

**ROS 2 (Robot Operating System 2)** is the industry-standard open-source framework and middleware for building modular robotics systems.

Despite its name, ROS 2 is not a traditional operating system like Linux or macOS. Instead, it is a **robotics middleware**—a communication layer that lets distributed software processes (called **Nodes**) exchange data reliably across threads, processes, and networked machines.

```mermaid
flowchart LR
    subgraph Sensors
        CAM["Camera Node"]
        LIDAR["LiDAR Node"]
    end

    subgraph Processing
        NAV["Navigation Node"]
        CTRL["Motion Controller"]
    end

    subgraph Actuators
        BASE["Mobile Base Driver"]
    end

    CAM -->|"Image topic"| NAV
    LIDAR -->|"LaserScan topic"| NAV
    NAV -->|"Velocity commands"| CTRL
    CTRL -->|"Motor signals"| BASE
```

---

## 1. Core Architectural Mental Model

Robots are complex machines composed of many hardware and software components. Building a monolithic program to read sensors, plan trajectories, and drive motors leads to brittle, hard-to-debug code.

ROS 2 breaks the system down into decoupled building blocks:

- **Nodes:** Single-purpose programs (e.g., reading a LiDAR sensor or computing a path).
- **Communication Paradigms:**
  - **Topics (Publish / Subscribe):** Continuous, unidirectional data streams (e.g., sensor telemetry, camera feeds).
  - **Services (Request / Response):** Synchronous or asynchronous two-way remote procedure calls (e.g., trigger calibration, compute a sum, spawn an entity).
  - **Parameters:** Configuration values set at launch or adjusted at runtime.

---

## 2. Nodes: The Building Blocks

A **Node** is a process that performs a specific robotics computation. In modern ROS 2, nodes are best implemented using **Object-Oriented Programming (OOP)** by inheriting from the client library's base Node class (`rclcpp::Node` in C++ or `rclpy.node.Node` in Python).

Python Example

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node


class HelloWorldNode(Node):
    """A simple ROS2 node that prints "Hello World!" every second."""

    def __init__(self):
        super().__init__("hello_world_node")
        self.get_logger().info("Hello World Node has been started!")

        # Implementation 1
        # while rclpy.ok():
        #     self.timer_callback()
        #     self.get_clock().sleep_for(rclpy.duration.Duration(seconds=1))

        # Implementation 2
        self.create_timer(1.0, self.timer_callback)

    def timer_callback(self):
        """Callback function that is called every second."""
        self.get_logger().info("Hello World!")


def main(args=None):
    # Initialize the ROS2 Python client library
    rclpy.init(args=args)

    # Create a ROS2 node, then spin the node to keep it alive, finally destroy the node
    node = HelloWorldNode()
    rclpy.spin(node)
    node.destroy_node()

    # Shutdown the ROS2 Python client library
    rclpy.shutdown()


if __name__ == "__main__":
    main()
```

C++ Example

```cpp
#include "rclcpp/rclcpp.hpp"

class HelloWorldNode : public rclcpp::Node
{
public:
    HelloWorldNode() : Node("hello_world_node")
    {
        // Initialize the timer
        timer_ = nullptr;
        log_startup_message();
        create_periodic_timer();
    }

private:
    // Timer to periodically log a message
    rclcpp::TimerBase::SharedPtr timer_;
    // Counter to keep track of the number of periodic messages logged
    int counter_ = 0;
    // Log a message to indicate that the node has started
    void log_startup_message()
    {
        RCLCPP_INFO(this->get_logger(), "Hello, World! Node has started.");
    }

    // Create a timer to periodically log a message
    void create_periodic_timer()
    {
        timer_ = this->create_wall_timer(
            std::chrono::seconds(1),
            [this]()
            {
                log_periodic_message();
            });
    }

    // Log a periodic message
    void log_periodic_message()
    {
        RCLCPP_INFO(this->get_logger(), "Hello, World! This is a periodic message. Counter: %d", counter_++);
    }
};

int main(int argc, char *argv[])
{
    // Initialize the ROS 2 client library
    rclcpp::init(argc, argv);

    // Create a custom node
    auto node = std::make_shared<HelloWorldNode>();
    // Keep the node alive until it is shut down
    rclcpp::spin(node);
    // Destroy the node
    node.reset();

    // Shutdown the ROS 2 client library
    rclcpp::shutdown();
    return 0;
}
```

---

## 3. Topics: Publish / Subscribe Pattern

**Topics** enable asynchronous, many-to-many, unidirectional data streaming.

- A **Publisher** produces messages and pushes them to a named channel (topic).
- A **Subscriber** listens to the named channel and receives incoming messages via a callback.
- Publishers and subscribers are completely decoupled: publishers do not know who is listening, and subscribers do not care who generated the data.

```mermaid
flowchart LR
    subgraph Publisher Nodes
        NS1["news_station_py<br/>(/city_a/news)"]
        NS2["news_station_cpp<br/>(/city_b/news)"]
    end

    subgraph Topics
        T1["/city_a/news<br/>(custom_interfaces/msg/News)"]
        T2["/city_b/news<br/>(custom_interfaces/msg/News)"]
        TR["/remapped_news<br/>(custom_interfaces/msg/News)"]
    end

    subgraph Subscriber Nodes
        R1["radio_py<br/>(city_a listener)"]
        R2["radio_cpp<br/>(city_b listener)"]
        RR["radio_py_remapped"]
    end

    NS1 --> T1 --> R1
    NS2 --> T2 --> R2
    NS2 -.-> TR -.-> RR
```

### Custom Message Interfaces (`.msg`)

ROS 2 uses strongly-typed message definitions stored in a `msg/` directory inside an interface package.

```text
# custom_interfaces/msg/News.msg
string datetime
string title
string content
```

### Publisher and Subscriber Code

#### Publisher Node (Python)

```python
from custom_interfaces.msg import News
import rclpy
from rclpy.node import Node

class NewsStationNode(Node):
    def __init__(self):
        super().__init__("news_station_node")
        self.publisher_ = self.create_publisher(News, "news", 10)
        self.timer_ = self.create_timer(1.0, self.publish_news)

    def publish_news(self):
        msg = News()
        msg.datetime = "2026-08-16 10:00:00"
        msg.title = "Robotics Daily"
        msg.content = "ROS 2 Jazzy is deployed successfully!"
        self.publisher_.publish(msg)
        self.get_logger().info(f"Published: {msg.title}")
```

#### Subscriber Node (C++)

```cpp
#include "rclcpp/rclcpp.hpp"
#include "custom_interfaces/msg/news.hpp"

class RadioNode : public rclcpp::Node
{
public:
    RadioNode() : Node("radio_node")
    {
        subscription_ = this->create_subscription<custom_interfaces::msg::News>(
            "news", 10,
            [this](const custom_interfaces::msg::News::SharedPtr msg) {
                RCLCPP_INFO(this->get_logger(), "Received News: [%s] %s",
                            msg->title.c_str(), msg->content.c_str());
            });
    }

private:
    rclcpp::Subscription<custom_interfaces::msg::News>::SharedPtr subscription_;
};
```

---

## 4. Services: Request / Response Pattern

While topics handle continuous streams, **Services** handle on-demand transactions where a **Client** sends a request to a **Server** and waits for a reply.

```mermaid
sequenceDiagram
    autonumber
    actor Trigger as Caller / Timer
    participant Client as acc_client (Client Node)
    participant Server as acc_server (Server Node)

    Trigger->>Client: Request computation (a=5, b=10, c=15)
    Client->>Server: /accumulate Request (Acc.srv)
    Note over Server: Compute sum = 5 + 10 + 15 = 30
    Server-->>Client: /accumulate Response (sum=30)
    Client->>Trigger: Async Future Callback receives result
```

### Custom Service Specification (`.srv`)

Service files define the Request schema above the `---` separator and the Response schema below it.

```text
# custom_interfaces/srv/Acc.srv
int64 a
int64 b
int64 c
---
int64 sum
```

### Server & Asynchronous Client

#### Service Server (C++)

```cpp
#include "rclcpp/rclcpp.hpp"
#include "custom_interfaces/srv/acc.hpp"

class AccServer : public rclcpp::Node
{
public:
    AccServer() : Node("acc_server")
    {
        service_ = this->create_service<custom_interfaces::srv::Acc>(
            "accumulate",
            [this](const std::shared_ptr<custom_interfaces::srv::Acc::Request> req,
                   std::shared_ptr<custom_interfaces::srv::Acc::Response> res) {
                res->sum = req->a + req->b + req->c;
                RCLCPP_INFO(this->get_logger(), "Incoming request: %ld + %ld + %ld = %ld",
                            req->a, req->b, req->c, res->sum);
            });
    }

private:
    rclcpp::Service<custom_interfaces::srv::Acc>::SharedPtr service_;
};
```

#### Asynchronous Non-Blocking Client (Python)

```python
import rclpy
from rclpy.node import Node
from custom_interfaces.srv import Acc

class AccClient(Node):
    def __init__(self):
        super().__init__("acc_client")
        self.client = self.create_client(Acc, "accumulate")
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().warn("Waiting for /accumulate service...")

    def send_request(self, a, b, c):
        req = Acc.Request()
        req.a, req.b, req.c = a, b, c
        future = self.client.call_async(req)
        future.add_done_callback(self.response_callback)

    def response_callback(self, future):
        try:
            response = future.result()
            self.get_logger().info(f"Accumulated result: {response.sum}")
        except Exception as e:
            self.get_logger().error(f"Service call failed: {e}")
```

---

## 5. Parameters and Launch Orchestration

### Dynamic Parameters

Parameters allow configuring node properties without modifying or recompiling source code.

- **Declare:** Nodes declare parameters with default values (`declare_parameter("timer_interval", 1.0)`).
- **Update at runtime:** Users can modify parameters on running nodes:
  ```bash
  ros2 param set /news_station_node timer_interval 0.25
  ```
- **Load via YAML:**
  ```yaml
  # config/news_station.yaml
  /news_station_node:
    ros__parameters:
      timer_interval: 0.5
  ```

### Launch Files: Declarative System Startup

Real-world robots require launching dozens of nodes, remapping topic names, and setting namespaces. ROS 2 provides two main launch formats:

1. **Python Launch Files (`.launch.py`):** Programmatic, flexible, and conditional logic.
2. **XML Launch Files (`.launch.xml`):** Concise, declarative, and easy to read.

```xml
<!-- topics_bringup/launch/topics.launch.xml -->
<launch>
  <group>
    <push-ros-namespace namespace="city_a"/>
    <node pkg="topic_py_pkg" exec="news_station_py" name="news_station_py_1"/>
    <node pkg="topic_py_pkg" exec="radio_py" name="radio_py_1"/>
  </group>

  <group>
    <push-ros-namespace namespace="city_b"/>
    <node pkg="topic_cpp_pkg" exec="news_station_cpp" name="news_station_cpp_1"/>
    <node pkg="topic_cpp_pkg" exec="radio_cpp" name="radio_cpp_1"/>
  </group>
</launch>
```

---

## 6. Workspace Setup & Build Workflow

A ROS 2 workspace follows a standard directory structure:

```text
ros_workspace/
├── src/                    # Source code for packages
│   ├── my_cpp_pkg/         # C++ package (CMakeLists.txt, package.xml)
│   └── my_py_pkg/          # Python package (setup.py, package.xml)
├── build/                  # Intermediate compilation artifacts
├── install/                # Built executables, libraries, and setup scripts
└── log/                    # Build and runtime log files
```

### Common Build Commands (`colcon`)

```bash
# Build all packages in workspace
colcon build

# Build specific packages to save time
colcon build --packages-select topic_cpp_pkg topic_py_pkg

# Symlink Python files for instant reload during development
colcon build --symlink-install

# Source the newly compiled workspace environment
source install/setup.bash
```

In real-world projects, it's convenient to add `source install/setup.bash` to `.envrc` and use `allow direnv` to automatically source the workspace when entering the directory.

---

## 7. Essential ROS 2 CLI Cheat Sheet

### Node Introspection

```bash
ros2 node list                     # List all active nodes in the computation graph
ros2 node info /turtle_chaser      # Inspect publishers, subscribers, and services of a node
rqt_graph                          # Launch GUI visualizer of the computational graph
```

### Topic Inspection & Publishing

```bash
ros2 topic list -t                 # List active topics with their message types
ros2 topic echo /turtle1/pose      # Print live stream of messages published to a topic
ros2 topic hz /turtle1/pose        # Measure publishing frequency in Hertz
ros2 topic bw /turtle1/pose        # Measure bandwidth usage
ros2 topic pub -r 5 /news custom_interfaces/msg/News "{datetime: '2026-08-16', title: 'Daily News', content: 'Ready'}"
```

### Service Operations

```bash
ros2 service list -t               # List active services with types
ros2 interface show custom_interfaces/srv/Acc # Display .srv definition
ros2 service call /accumulate custom_interfaces/srv/Acc "{a: 5, b: 10, c: 15}"
```

### Parameter Management

```bash
ros2 param list                    # List parameters for all running nodes
ros2 param get /news_station_node timer_interval
ros2 param set /news_station_node timer_interval 0.5
ros2 param dump /news_station_node # Export current parameters to YAML
```

### Rosbag Data Recording & Playback

```bash
ros2 bag record -o test_run /turtle1/pose /turtle1/cmd_vel
ros2 bag info test_run
ros2 bag play test_run
```
