

done(
  I type f
  the program is "f"
  I see "f"
  (three tokens)

done(
  I type unction [space]
  I see six tokens: function nbsp; ( ) { }
  There is nice padding around all the symbols

do(
  I type foo
  I see function foo ( ) { }

I type (
Nothing really happens

I type backspace
the program is "function"

I type (
we're back to the empty function

I type enter
I see function ( ▢ ) {
  ▢ }
The program is still empty

I type hello
I see function ( ▢ ) {
  "hello" }
The program is function() {
  "hello" }

I type (
I see function ( ▢ ) {
  hello (
    ▢ ) }
The program is function() {
  hello() }

I type 42
I see function ( ▢ ) {
  hello (
    42 ) }

I type +8
I see function ( ▢ ) {
  hello (
    42 + 8 ) }

Start over

I type var 
var is its own token
