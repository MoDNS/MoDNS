
mod listeners;
mod plugins;

pub fn hello() {
	println!("Hello from server lib!");
	listeners::hello();
	plugins::hello();
}