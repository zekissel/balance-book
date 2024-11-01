use crate::database::models::BookError;
use crate::database::models::User;
use crate::AuthState;
use sqlx::SqlitePool;
use tauri::{Manager, State};
use tokio::sync::Mutex;

use crate::database::api_account::create_account;

/* MARK: REGISTER
*/
#[tauri::command]
pub async fn register_user(
    handle: tauri::AppHandle,
    state: State<'_, AuthState>,
    name: &str,
    pass: &str,
) -> Result<User, BookError> {
    let user = create_user(handle.clone(), name, pass).await;
    match user {
        Err(be) => Err(be),
        Ok(user) => {
            match create_account(
                handle.clone(),
                None,
                "Cash",
                "Checking",
                0,
                &chrono::Local::now().naive_local().to_string(),
                user.id.as_str(),
            )
            .await {
                Ok(_) => {
                    state.user.lock().await.replace(user.clone());
                    Ok(user)
                },
                /* user has successfully been created, just not cash account */
                Err(_be) => Ok(user),
            }
        }
    }
}

/* MARK: VERIFY
*/
#[tauri::command]
pub async fn verify_user(
    handle: tauri::AppHandle,
    state: State<'_, AuthState>,
    name: &str,
    pass: &str,
) -> Result<User, BookError> {
    use argon2::Config;
    use password_hash::SaltString;

    let credentials = read_user_by_name(handle.clone(), name).await;
    match credentials {
        Err(be) => return Err(be),
        Ok(credentials) => {
            let salt_i = SaltString::from_b64(&credentials.salt).unwrap();
            let pwhash =
                argon2::hash_encoded(
                    pass.as_bytes(), 
                    salt_i.to_string().as_bytes(), 
                    &Config::default()
                ).unwrap();

            match pwhash == credentials.pwhash {
                true => {
                    state.user.lock().await.replace(credentials.clone());
                    return Ok(credentials);
                }
                false => {
                    return Err(BookError {
                        code: 2,
                        message: "Invalid credentials".to_string(),
                    })
                }
            };
        }
    }
}

/* MARK: LOGOUT
*/
#[tauri::command]
pub async fn logout_user(
    _handle: tauri::AppHandle,
    state: State<'_, AuthState>,
) -> Result<(), BookError> {
    state.user.lock().await.take();
    Ok(())
}



/* MARK: CREATE
 */
async fn create_user(
    handle: tauri::AppHandle,
    name: &str,
    pass: &str,
) -> Result<User, BookError> {
    use argon2::Config;
    use password_hash::{rand_core::OsRng, SaltString};
    let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();

    if read_user_by_name(handle.clone(), name).await.is_ok() {
        return Err(BookError {
            code: 1,
            message: "User already exists".to_string(),
        });
    }

    let salt = SaltString::generate(&mut OsRng);
    let pwhash = argon2::hash_encoded(
        pass.as_bytes(), 
        salt.to_string().as_bytes(), 
        &Config::default()
    ).unwrap();
    assert!(argon2::verify_encoded(&pwhash, pass.as_bytes()).unwrap());
    let id = uuid::Uuid::new_v4();

    match sqlx::query("
        INSERT INTO users (id, name, email, pwhash, salt) 
        VALUES ($1, $2, $3, $4, $5)
    ",)
    .bind(id.to_string())
    .bind(name)
    .bind(None::<String>)
    .bind(pwhash)
    .bind(salt.to_string())
    .execute(&pool)
    .await {
        Ok(_) => {}
        Err(e) => return Err(BookError { code: 2, message: e.to_string() }),
    };
    Ok(User {
        id: id.to_string(),
        name: name.to_string(),
        email: None,
        pwhash: "".to_string(),
        salt: "".to_string(),
    })
}

/* MARK: READ
 */
async fn read_user_by_name(
    handle: tauri::AppHandle, 
    name: &str
) -> Result<User, BookError> {
    let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();

    let user = sqlx::query_as::<_, User>("
        SELECT * FROM users 
        WHERE name = $1 LIMIT 1
    ",)
    .bind(name)
    .fetch_one(&pool)
    .await;

    match user {
        Ok(user) => Ok(user),
        Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}

