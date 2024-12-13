# Full-stack coding assignment

Develop a basic family photo management application, where a family member can view photos in albums of another family member, while being able to create, update, and delete their own photos and albums.

## Assignment Requirements


### Public APIs
- https://jsonplaceholder.typicode.com/users
- https://jsonplaceholder.typicode.com/users/{userId}/albums
- https://jsonplaceholder.typicode.com/photos

Public API guide https://jsonplaceholder.typicode.com/guide/

Public API note
JSONPlaceholder doesn’t persist changes, so we’d expect to see how you would implement the API, but you may keep the changes in state. 

Think of it as optimistic updates! 

## Setup and Configuration

* Create a new React application using Typescript
* Create a Backend for a Frontend using Typescript that maps the API response
* Configure the project with a linter and a code formatter.
* We do not expect anything hosted on the cloud, localhost is fine


## User Interface
Design a simple and responsive UI with the following components:

* Add Photo: Allows users to upload a photo, assign it to an existing or new album, and add a title or description.
* (page) My users: Display a list of users (show their username and email) which opens a page to the albums of that user, when clicked on.
* (page) My user albums: Display a list of photo albums for a user (show their username and email) which opens a page to the photos of that album, when clicked on.
* (page) My album photos: Display a list of photos for a users album (show their username).


## Functionality
1. CRUD photos and albums
    1. Read other users photos & albums
    2. Create, update, and delete current user’s photo’s & albums
2. I should be able to open the albums page for a user.
    1. If I open my own album page I want to be able to edit/delete my photos and albums.


 ### TypeScript
* Ensure that all components are typed correctly.
* Use interfaces and types to define the structure of the API response and component props.

###  Testing

* Write at least 1 unit test


### Best Practices

* Write clean, modular, and reusable code.
* Ensure the application is performant and handles API errors gracefully.


### Bonus (Optional):

* Follow best practices for accessibility (e.g., semantic HTML, aria labels).
* Write unit test(s) for any business logic created in the BE for a FE.


### Deliverables:

*  A GitHub repository containing the code for the project.
*  A README.md file with instructions on how to run the project locally.
*  (Optional) A live demo link if the application is deployed.
    

### Evaluation Criteria:

* Code quality and organization
* Front-end & Backend libraries used for the assignment.
* Responsiveness
* Effective use of testing
* Bonus features (if implemented)



