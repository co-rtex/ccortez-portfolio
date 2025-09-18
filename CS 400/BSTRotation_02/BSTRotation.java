package bstrotation_02;

import java.util.Objects;

/**
 * BSTRotation implements the local rotation operation for a BST.
 * - Extends BinarySearchTree_Placeholder<T> (may be swapped to your working
 * BST)
 * - Uses only the inherited protected 'root' field
 * - Does not allocate new nodes; it only rewires existing links
 * - Provides public test1/test2/test3 (non-static, no-arg) that return boolean
 * - Includes a main() to run the tests and print results
 *
 * @param <T> the comparable element type stored in the BST
 */
public class BSTRotation<T extends Comparable<T>> extends BinarySearchTree_Placeholder<T> {

    /** No-args constructor (explicit for clarity). */
    public BSTRotation() {
        super();
    }

    /**
     * Performs the rotation operation on the provided nodes within this tree.
     * When the provided child is a left child of the provided parent, this
     * method will perform a right rotation. When the provided child is a right
     * child of the provided parent, this method will perform a left rotation.
     * When the provided nodes are not related in one of these ways, this
     * method will either throw a NullPointerException: when either reference is
     * null, or otherwise will throw an IllegalArgumentException.
     *
     * @param child  the node being rotated from child to parent position
     * @param parent the node being rotated from parent to child position
     * @throws NullPointerException     when either passed argument is null
     * @throws IllegalArgumentException when the provided child and parent
     *                                  nodes are not initially related as (parent,
     *                                  its child)
     */
    @Override
    protected void rotate(BinaryNode<T> child, BinaryNode<T> parent)
            throws NullPointerException, IllegalArgumentException {

        // ==== 1) Validate inputs and relationship ====
        if (child == null || parent == null)
            throw new NullPointerException("child and parent must be non-null");

        // child must literally be parent's left or right
        boolean isLeftChild = (parent.getLeft() == child);
        boolean isRightChild = (parent.getRight() == child);
        if (!isLeftChild && !isRightChild)
            throw new IllegalArgumentException("Nodes are not in a parent-child relationship");

        // Keep references we need to reattach later
        BinaryNode<T> grand = parent.getParent(); // parent’s parent (may be null if parent was root)
        boolean parentWasLeftOfGrand = (grand != null && grand.getLeft() == parent); // where 'parent' sat under grand

        // ==== 2) Perform the local rotation around (parent, child) ====
        if (isLeftChild) {
            // ----- Right Rotation -----
            // parent child
            // / \ / \
            // child Pright ==> Cleft parent
            // / \ / \
            // Cleft Cright Cright Pright
            BinaryNode<T> cRight = child.getRight(); // "beta" subtree that moves

            // Move child's right subtree to parent's left
            parent.setLeft(cRight);
            if (cRight != null)
                cRight.setParent(parent);

            // Make parent the right child of child
            child.setRight(parent);
            parent.setParent(child);
        } else {
            // ----- Left Rotation -----
            // parent child
            // / \ / \
            // Pleft child ==> parent Cright
            // / \ / \
            // Cleft Cright Pleft Cleft
            BinaryNode<T> cLeft = child.getLeft(); // "beta" subtree that moves

            // Move child's left subtree to parent's right
            parent.setRight(cLeft);
            if (cLeft != null)
                cLeft.setParent(parent);

            // Make parent the left child of child
            child.setLeft(parent);
            parent.setParent(child);
        }

        // ==== 3) Reattach the rotated pair back to grand (or update root) ====
        child.setParent(grand);
        if (grand == null) {
            // Rotation involved the root: update root reference
            this.root = child;
        } else if (parentWasLeftOfGrand) {
            grand.setLeft(child);
        } else {
            grand.setRight(child);
        }
        // All pointers now form a valid BST shape with ordering preserved.
    }

    /*
     * =========================
     * ===== Test Utilities =====
     * =========================
     */

    // Helper: create a node for Integer-based tests (kept local to the test
    // methods’ usage).
    @SuppressWarnings("unchecked")
    private BinaryNode<T> n(int v) {
        return new BinaryNode<>((T) (Object) Integer.valueOf(v));
    }

    // Helper: set both children and wire parent pointers.
    private void setChildren(BinaryNode<T> p, BinaryNode<T> left, BinaryNode<T> right) {
        p.setLeft(left);
        if (left != null)
            left.setParent(p);
        p.setRight(right);
        if (right != null)
            right.setParent(p);
    }

    // Helper: make 'r' the root of this tree, clearing its parent pointer.
    private void setRoot(BinaryNode<T> r) {
        this.root = r;
        if (r != null)
            r.setParent(null);
    }

    // Helper: safe inorder string (BinaryNode already provides toInOrderString()).
    private String inorder() {
        return (this.root == null) ? "[]" : this.root.toInOrderString();
    }

    /*
     * ==============================
     * ===== Required Test Cases =====
     * ==============================
     */

    /**
     * test1:
     * - Right rotation
     * - Rotation includes the root
     * - 0 shared children between parent & child (excluding their link)
     */
    public boolean test1() {
        // Tree: 10
        // /
        // 5
        BinaryNode<T> p = n(10);
        BinaryNode<T> c = n(5);
        setRoot(p);
        setChildren(p, c, null);

        String before = inorder();
        rotate(c, p);

        boolean ok = this.root == c &&
                c.getParent() == null &&
                c.getRight() == p &&
                p.getParent() == c &&
                p.getLeft() == null &&
                Objects.equals(before, inorder());

        return ok;
    }

    /**
     * test2:
     * - Left rotation
     * - Rotation does NOT include the root
     * - 3 shared children (P.left, C.left, C.right all non-null)
     */
    public boolean test2() {
        // Tree before:
        // 20(G)
        // \
        // 30(P)
        // / \
        // 25 40(C)
        // / \
        // 35 45
        BinaryNode<T> G = n(20);
        BinaryNode<T> P = n(30);
        BinaryNode<T> C = n(40);
        BinaryNode<T> L1 = n(25);
        BinaryNode<T> L2 = n(35);
        BinaryNode<T> R2 = n(45);

        setRoot(G);
        setChildren(G, null, P);
        setChildren(P, L1, C);
        setChildren(C, L2, R2);

        String before = inorder();
        rotate(C, P);

        // After rotation, expect:
        // 20(G)
        // \
        // 40(C)
        // / \
        // 30(P) 45
        // / \
        // 25 35
        boolean ok = this.root == G &&
                G.getRight() == C && C.getParent() == G &&
                C.getLeft() == P && P.getParent() == C &&
                P.getLeft() == L1 && L1.getParent() == P &&
                P.getRight() == L2 && L2.getParent() == P &&
                C.getRight() == R2 && (R2 == null || R2.getParent() == C) &&
                Objects.equals(before, inorder());

        return ok;
    }

    /**
     * test3:
     * Combines two sub-tests to cover 1 and 2 shared-children cases:
     * A) Right rotation with exactly 1 shared child (only P.right exists)
     * B) Left rotation with exactly 2 shared children (P.left and C.left exist)
     */
    public boolean test3() {
        // --- A) Right rotation, 1 shared child ---
        // 50(G)
        // /
        // 20(P)
        // / \
        // 10(C) 30
        BinaryNode<T> G1 = n(50);
        BinaryNode<T> P1 = n(20);
        BinaryNode<T> C1 = n(10);
        BinaryNode<T> Pr1 = n(30); // the single shared child among {P.right, C.left, C.right}

        setRoot(G1);
        setChildren(G1, P1, null);
        setChildren(P1, C1, Pr1); // C1 has no children

        String beforeA = inorder();
        rotate(C1, P1);

        boolean okA = this.root == G1 &&
                G1.getLeft() == C1 && C1.getParent() == G1 &&
                C1.getRight() == P1 && P1.getParent() == C1 &&
                P1.getLeft() == null &&
                P1.getRight() == Pr1 && Pr1.getParent() == P1 &&
                Objects.equals(beforeA, inorder());

        // --- B) Left rotation, 2 shared children ---
        // 20(G)
        // \
        // 30(P)
        // / \
        // 25 40(C)
        // /
        // 35
        BinaryNode<T> G2 = n(20);
        BinaryNode<T> P2 = n(30);
        BinaryNode<T> C2 = n(40);
        BinaryNode<T> P2L = n(25); // P.left exists
        BinaryNode<T> C2L = n(35); // C.left exists (C.right null) -> total shared = 2

        setRoot(G2);
        setChildren(G2, null, P2);
        setChildren(P2, P2L, C2);
        setChildren(C2, C2L, null);

        String beforeB = inorder();
        rotate(C2, P2);

        boolean okB = this.root == G2 &&
                G2.getRight() == C2 && C2.getParent() == G2 &&
                C2.getLeft() == P2 && P2.getParent() == C2 &&
                P2.getLeft() == P2L && P2L.getParent() == P2 &&
                P2.getRight() == C2L && C2L.getParent() == P2 &&
                C2.getRight() == null &&
                Objects.equals(beforeB, inorder());

        return okA && okB;
    }

    /*
     * ======================
     * ======= Runner =======
     * ======================
     */

    /**
     * Simple runner that executes the required tests and prints pass/fail.
     */
    public static void main(String[] args) {
        BSTRotation<Integer> t = new BSTRotation<>();

        System.out.println("test1 (right, root, 0 shared) : " + t.test1());
        System.out.println("test2 (left, non-root, 3 shared): " + t.test2());
        System.out.println("test3 (right+left, 1 & 2 shared): " + t.test3());

        boolean all = t.test1() && t.test2() && t.test3();
        System.out.println("ALL PASS: " + all);
    }
}
