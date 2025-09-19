/**
 * This interface defines an ADT for data structures that support storing a
 * collection of comparable values in their natural ordering.
 */
public interface SortedCollection<T extends Comparable<T>> {
    public void insert(T data) throws NullPointerException;
    public boolean contains(Comparable<T> data) throws NullPointerException;
    public int size();
    public boolean isEmpty();
    public void clear();
}
