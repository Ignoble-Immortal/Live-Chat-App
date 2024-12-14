# Live Chat Application

This Chat Application is a real-time messaging platform that allows users to communicate instantly with each other. Designed with a minimalistic and modern interface, it offers a seamless chatting experience. Users can sign up, log in, and start conversations with friends or colleagues by creating or joining rooms. Built using the latest web technologies, the application ensures fast, reliable, and secure messaging. Key features include user authentication, real-time updates, and a responsive design. Perfect for personal use, team collaboration, or customer support.


## Installation

To install the project, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/Ignoble-Immortal/Live-Chat-App.git
    cd Live-Chat-App
    ```

2. Install the necessary dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory of your project and add the following variables:
    ```plaintext
    MONGO_URI=your_mongo_db_connection_string
    JWT_SECRET=your_jwt_secret
    ```

### Example `.env` File

Here's an example of what your `.env` file should look like:

```plaintext
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
```

## To Start the project

```sh
npm start
```
You can access the server at `http://localhost:3000`.
