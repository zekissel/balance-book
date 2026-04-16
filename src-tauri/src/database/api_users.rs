use diesel::prelude::*;

use super::api::establish_connection;
use super::models::{ User, AddUser };
//use super::api_accts::create_account;

/* User CRUD */
#[tauri::command]
pub async fn create_user(
  app_handle: tauri::AppHandle,
  name: &str, 
) -> Result<Option<User>, String> {
  use super::schema::users;
  
  match read_user_by_name(app_handle.clone(), name).await {
    Some(_) => return Err("user already exists".to_string()),
    None => (),
  };

  let new_user = AddUser { id: &uuid::Uuid::new_v4().to_string(), name };
  let user = diesel::insert_into(users::table)
    .values(&new_user)
    .returning(User::as_returning())
    .get_result(&mut establish_connection(app_handle.clone()))
    .expect("error saving new user");

  //let _ = create_account(app_handle, None, 0, &chrono::Utc::now().to_string(), "Cash", "Checking", &user.id).await;

  Ok(Some(user))
}


async fn read_user_by_name(
  app_handle: tauri::AppHandle,
  name_i: &str,
) -> Option<User> {
  use super::schema::users::dsl::*;

  users
    .filter(name.eq(name_i))
    .first::<User>(&mut establish_connection(app_handle.clone()))
    .ok()
}

#[tauri::command]
pub async fn read_users(
  app_handle: tauri::AppHandle
) -> Vec<User> {
  use super::schema::users::dsl::*;

  users.load(&mut establish_connection(app_handle.clone()))
    .expect("error loading users")
}



#[tauri::command(rename_all = "snake_case")]
pub async fn update_user(
  app_handle: tauri::AppHandle, 
  id_i: &str,
  new_name: &str,
) -> Result<User, String> {
  use super::schema::users::dsl::*;

  match read_user_by_name(app_handle.clone(), new_name).await {
    Some(_) => return Err("user already exists".to_string()),
    None => (),
  };

  Ok(diesel::update(users.find(id_i))
    .set(name.eq(new_name))
    .returning(User::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .expect("error updating user"))
}


#[tauri::command(rename_all = "snake_case")]
pub async fn delete_user(
  app_handle: tauri::AppHandle, 
  id_i: &str
) -> Result<bool, ()> {
  use super::schema::users::dsl::*;

  Ok(diesel::delete(users.find(id_i))
    .execute(&mut establish_connection(app_handle))
    .expect("error deleting user") > 0)
}