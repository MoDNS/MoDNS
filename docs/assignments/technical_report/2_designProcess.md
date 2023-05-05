\pagebreak
# MoDNS Technical Report

This report will detail the technical design process, decisions, solutions, hardwares & softwares, and design considerations involved in developing the MoDNS Framework.

## Design Process

Firstly, we will cover the design process that was taken to complete the project. The team met and discussed the parts of the project that each member would like to work on. These responsibilities were delegated and the members were split into three groups: Frontend, Backend, and DevOps. The team began by researching DNS, its issues, and alternative methods to achieve the solution. The idea to create a modular system had already been decided on by this point. However, the team needed to decide and discuss what the process of a modular DNS server would look like and how we should achieve it.

### Major Decisions

During the design and research process, the team encountered the following questions that required weighing two or more solutions.

#### Plugin Loading: Lua vs Dynamic Libraries

Initially, our group needed to decide how we were going to provide the framework of the modularization for the DNS server. For the solution we considered an embedded scripting language like Lua. On the other hand, dynamic libraries (aka shared objects or DLLs) were considered as the alternative. We understood the technical complexity needed for Lua as well as the time that would be required to implement an interpreter. Not to mention the team's requirement to learn the language of Lua itself. However, upon doing research on Lua we found that the execution time would be exponentially longer compared to that of the shared object alternative. Since one of our requirements was to not substantially impact DNS performance, we decided to implement plugins as dynamic libraries.

#### Programming Languages: GO vs Rust vs C++

The architecture we had in mind for our project put a few requirements in place for our choice of backend programming languages. Since we were looking to build a performance-critical service, we decided to use a compiled systems programming language. With this in mind, we chose the three languages as our options. These languages were Golang, Rust, and C++. We also desired a language that would allow us to quickly produce robust and safe code which utilizes multithreading and supports dynamic library loading.

We first considered Go, since its Go routines feature would provide simple multithreading. As we later found out however, Go’s support for dynamic libraries (which Go calls plugins) came with several major limitations which would seriously hinder the development of plugins for our system. Next, we considered C++, which is commonly used in systems which utilize dynamic loading due to its use of the stable C ABI. One of our members had worked with multithreading in C++ in the past. He drew attention to the amount of overhead and overall fragility of multithreading in C++. This spelt the end of C++'s consideration for the project. We finally settled on Rust as it provided an acceptable solution for both requirements. Multithreading in Rust can be accomplished easily using the async/await system and the lib loading crate in Rust allows for dynamic loading of libraries compiled to the C ABI. For these reasons, we found that Rust was a good middle ground that also provides additional memory safety and high-quality documentation.

#### Deployment Method: Executable vs Operating System

To deploy the framework, there were two schools of thoughts. One was an operating system similar to an Ubuntu server that would have the framework baked into the OS.The other solution would take the form of an executable that the user would run on the server. While debating on whether to make a custom operating system or just an executable, we had to take multiple factors into consideration. The amount of time that it would take for us to create the program, the speed of the program, and how portable it would be were all points of consideration when making this decision. We ultimately decided to create an executable because making an operating system would take a significantly longer amount of time. Seeing that we only had a 6 month time period, making an executable would allow us to complete the project within the deadline.

#### Front End Framework: Javascript React vs HTML/CSS

For the front end development, the front end group needed to make a decision on how they would develop the website. Their options were HTML/CSS or Javascript React.Using HTML/CSS forces developers to create and style components that React‘s libraries already have. This adds complexity and time to the development process not only for base components but each new component that is added. Additionally, React uses Javascript which allows for conditional rendering, iterative component creation, component recycling. Alongside these reasons, the team had previous experience with React and therefore would be able to begin producing results at a faster rate than its alternative.

#### Front End and Backend Communication: Rest API vs GraphQL

RESTful APIs have been the standard for connecting front ends and back ends for web services for years. They involve a predefined list of HTTP endpoints which provide data in a set schema. GraphQL is a relatively new standard for APIs which allows clients (in this case, our frontend) to specify the exact schema for the data they are requesting. This has obvious benefits for frontend developers, however it greatly increases complexity on the backend side. We decided against GraphQL for our project because the relatively small amount of data changing hands between the frontend and backend does not justify the increase in complexity on the backend.