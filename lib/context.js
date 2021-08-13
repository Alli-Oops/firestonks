import { createContext } from 'react';
export const UserContext = createContext({ user: null, username: null });


/*
UserContext - Here we use the react context API which allows you to scope a value in 
the component tree and then use that value anywhere in it’s children even if 
they’re seperated by multiple levels of components.

Because we need both the firebase user and username across multiple pages, 
it’s useful to have that context set up in the _app.js

context.js file that is the common place to import our context for any file that needs it. 
We import { createContext } from ‘react’ then 
We export a value called UserContext that initializes the context with a default value. 
In this case, the default value is an object that has a user set to null and username set to null

After creating the context in the context.js, we need to provide it somewhere in the component tree. 
In this case, it’s a global value - so we provide it in the _app.js file. 

In the _app.js file: We will wrap the child components inside the <UserContext.Provider>
Then, we include the value={userData} —> which will be the passed in value of the specific user and username. 
This will come from firebase.
*/