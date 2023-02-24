# MoDNS Technical Report
This report details the design process, decisions, solution, hardware and software, and design considerations involved in developing the MoDNS Framework.
## Design Process
The team met up and discussed what parts of the project each would like to work on and responsibilities were delegated. The team began by researching DNS, its issues, and alternative methods to achieve the solution.

### DNS


### DNS Issues


### Major Decisions

#### Plugin Loading: Lua vs Dynamic Libraries
Initially, our group needed to decide how we were going to provide the framework of the modularization for the DNS server. We saw our choices as either an embedded scripting language like Lua or dynamic libraries (aka shared objects or DLLs). We understood the technical complexity needed for Lua as well as the time that would be required to implement an interpreter and learn the language of Lua itself. However, upon doing research on Lua we found that the execution time for Lua would be exponentially longer compared to the shared object alternative. Since one of our requirements was to not substantially impact DNS performance, we decided to first implement plugins as dynamic libraries.

#### Programming Languages: GO vs Rust vs C++
The architecture we had in mind for our project put a few requirements in place for our choice of backend programming languages. Since we were looking to build a performance-critical service, we decided to use a compiled systems programming language. With this in mind, we chose the three languages mentioned above as our options. We also wanted a language that would let us quickly produce robust and safe code which utilizes multithreading and supports dynamic library loading.
We first considered Go, since its Goroutines feature would provide simple multithreading. We later found out, however, that Go’s support for dynamic libraries (which Go calls plugins) came with several major limitations which would seriously hinder development of plugins for our system. Next, we considered C++, which is commonly used in systems which utilize dynamic loading due to its use of the stable C ABI. One of our members who had worked with multithreading in C++ quickly shot this down, however. We finally settled on Rust since it provided an acceptable solution for both requirements. Multithreading in Rust can be accomplished easily using the async/await system, and the libloading crate in Rust allows for dynamic loading of libraries compiled to the C ABI. For these reasons, we found Rust a good middle ground that also provides added memory safety and high-quality documentation.

#### Deployment Method: Executable vs Operating System
While debating on whether to make a custom operating system or just an executable we had to weigh the amount of time that it would take for us to create the program, the speed of the program, and how portable it would be. We had ultimately decided to create an executable because making an operating system would take significantly longer, and since we only had a 6 month time period making an executable would allow us to complete the project.

#### Front End Framework: Javascript React vs HTML/CSS
Using HTML/CSS forces the developers to create and style components that React‘s libraries already have. This adds much more complexity and time to the development process for each base component, and each new component that is added. React uses Javascript which allows for conditional rendering, making components iteratively, and allows for the easy reuse of components.


#### Frontend and Backend Communication: Rest API vs GraphQL
RESTful APIs have been the standard for connecting frontends and backends for web services for years. They involve a predefined list of HTTP endpoints which provide data in a set schema. GraphQL is a relatively new standard for APIs which allows clients (in this case, our frontend) to specify the exact schema for the data they are requesting. This has obvious benefits for frontend developers, however it greatly increases complexity on the backend side. We decided against GraphQL for our project because the relatively small amount of data changing hands between the frontend and backend does not justify the increase in complexity on the backend.

### Solution Technique