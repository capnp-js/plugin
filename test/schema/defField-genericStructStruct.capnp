@0x82f1e98dc27909c4;

struct X {}
struct Trivial(T) {}

struct Y {
  f @0 :Trivial(X) = ();
}
